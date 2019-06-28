/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

// Package proc provides actual actions to be performed once the sync has filtered all events
package proc

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/pborman/uuid"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/merger"
	"github.com/pydio/cells/common/sync/model"
)

// ProcessFunc is a generic function signature for applying an operation
type ProcessFunc func(event merger.Operation, operationId string, progress chan int64) error

// ProcessorLocker defines a set of event based functions that can be called during processing
type ProcessorLocker interface {
	// LockFile sends LockEvent for Echo Filtering
	LockFile(operation merger.Operation, path string, operationId string)
	// UnlockFile sends UnlockEvent for Echo Filtering
	UnlockFile(operation merger.Operation, path string)
}

// Processor is a simple processor without external connections
type Processor struct {
	GlobalContext            context.Context
	Locker                   ProcessorLocker
	QueueSize                int
	Silent                   bool
	AlwaysSkipFilterToTarget bool
}

// NewProcessor creates a new processor
func NewProcessor(ctx context.Context) *Processor {
	return &Processor{
		GlobalContext: ctx,
		QueueSize:     4,
		Silent:        false,
	}
}

// Process calls all Operations to be performed on a Patch
func (pr *Processor) Process(patch merger.Patch, cmd *model.Command) {

	if !pr.AlwaysSkipFilterToTarget {
		patch.FilterToTarget(pr.GlobalContext, nil)
	}

	var interrupted bool

	// Send the patch itself on the doneChan
	defer func() {
		if interrupted {
			patch.Status(merger.ProcessStatus{
				IsError:      true,
				StatusString: "Patch interrupted by user",
				Error:        errors.New("patch interrupted by user"),
			})
		}
		patch.Done(patch)
	}()

	if patch.Size() == 0 {
		return
	}

	var cursor int64
	processUUID := uuid.New()
	total := patch.ProgressTotal()

	patch.Status(merger.ProcessStatus{StatusString: fmt.Sprintf("Start processing patch (total bytes %d)", total)})
	stats := patch.Stats()
	pending := make(map[string]int)
	if pen, ok := stats["Pending"]; ok {
		pending = pen.(map[string]int)
	}

	flusher := func(tt ...merger.OperationType) {}
	if session, err := patch.StartSessionProvider(&tree.Node{Path: "/"}); err == nil {
		defer patch.FinishSessionProvider(session.Uuid)
		flusher = func(tt ...merger.OperationType) {
			for _, t := range tt {
				if val, ok := pending[t.String()]; ok && val > 0 {
					patch.FlushSessionProvider(session.Uuid)
					return
				}
			}
		}
	} else {
		pr.Logger().Error("Error while starting Indexation Session", zap.Error(err))
	}

	serial := make(chan merger.Operation)
	parallel := make(chan merger.Operation)
	opsFinished := make(chan struct{})
	done := make(chan struct{})
	go func() {
		defer close(done)
		// Listen to cmd Chan
		var cmdChan chan model.SyncCmd
		if cmd != nil {
			var unsub chan bool
			cmdChan, unsub = cmd.Subscribe()
			defer close(unsub)
		}
		previousType := merger.OpUnknown
		wg := &sync.WaitGroup{}
		throttle := make(chan struct{}, pr.QueueSize)
		for {
			select {

			case cmd := <-cmdChan:
				fmt.Printf("Received command %d", cmd)
				if cmd == model.Interrupt {
					interrupted = true
				}

			case op := <-serial:
				// Flush for next type if it's different
				if previousType != merger.OpUnknown && op.Type() != previousType {
					flusher(op.Type())
				}
				previousType = op.Type()
				if interrupted || op.IsProcessed() {
					break
				}
				pr.processOperation(patch, processUUID, op, &cursor, total)

			case op := <-parallel:

				// Flush for next type if it's different
				if previousType != merger.OpCreateFile && previousType != merger.OpUpdateFile {
					flusher(merger.OpCreateFile, merger.OpUpdateFile)
				}
				previousType = op.Type()
				if interrupted || op.IsProcessed() {
					break
				}
				wg.Add(1)
				opCopy := op
				throttle <- struct{}{}
				go func() {
					defer func() {
						<-throttle
						wg.Done()
					}()
					pr.processOperation(patch, processUUID, opCopy, &cursor, total, true)
				}()

			case <-opsFinished:
				wg.Wait()
				return

			}
		}
	}()

	serialWalker := func(o merger.Operation) {
		serial <- o
	}

	patch.WalkOperations([]merger.OperationType{merger.OpCreateFolder}, serialWalker)
	patch.WalkOperations([]merger.OperationType{merger.OpMoveFolder}, serialWalker)
	patch.WalkOperations([]merger.OperationType{merger.OpMoveFile}, serialWalker)
	if patch.HasTransfers() {
		patch.WalkOperations([]merger.OperationType{merger.OpCreateFile, merger.OpUpdateFile}, func(o merger.Operation) {
			parallel <- o
		})
	} else {
		patch.WalkOperations([]merger.OperationType{merger.OpCreateFile, merger.OpUpdateFile}, serialWalker)
	}
	patch.WalkOperations([]merger.OperationType{merger.OpDelete}, func(o merger.Operation) {
		if o.GetNode() != nil {
			serial <- o
		}
	})
	if len(patch.OperationsByType([]merger.OperationType{merger.OpRefreshUuid})) > 0 {
		go pr.refreshFilesUuid(patch)
	}

	close(opsFinished)
	// Wait that all is done
	<-done
}

func (pr *Processor) processOperation(p merger.Patch, processId string, op merger.Operation, cursor *int64, total int64, withRetries ...bool) {
	cb, progress, complete, errorString, fields := pr.dataForOperation(p, op)
	if len(withRetries) > 0 {
		model.Retry(func() error {
			return pr.applyProcessFunc(op, processId, cb, complete, progress, errorString, cursor, total, fields...)
		}, 5*time.Second, 20*time.Second)
	} else {
		pr.applyProcessFunc(op, processId, cb, complete, progress, errorString, cursor, total, fields...)
	}
}

// applyProcessFunc takes a ProcessFunc and handle progress, status messages, etc
func (pr *Processor) applyProcessFunc(op merger.Operation, operationId string, callback ProcessFunc, completeString string, progressString string, errorString string, cursor *int64, total int64, fields ...zapcore.Field) error {

	fields = append(fields, zap.String("target", op.Target().GetEndpointInfo().URI))

	pgs := make(chan int64)
	var lastProgress float32
	defer close(pgs)
	go func() {
		for pg := range pgs {
			*cursor += pg
			progress := float32(*cursor) / float32(total)
			if progress-lastProgress > 0.01 { // Send 1 per percent
				log.Logger(pr.GlobalContext).Debug("Sending PG", zap.Float32("pg", progress))
				op.Status(merger.ProcessStatus{
					StatusString: pr.logAsString(progressString, nil, fields...),
					Progress:     progress,
				})
				lastProgress = progress
			}
		}
	}()

	err := callback(op, operationId, pgs)
	if err != nil {
		fields = append(fields, zap.Error(err))
		if !pr.Silent {
			pr.Logger().Error(errorString, fields...)
		}
	} else {
		op.SetProcessed()
		if !pr.Silent {
			pr.Logger().Info(completeString, fields...)
		}
	}

	isError := false
	loggerString := completeString
	if err != nil {
		isError = true
		loggerString = errorString
	}
	var end float32
	if total > 0 {
		end = float32(*cursor) / float32(total)
	}
	op.Status(merger.ProcessStatus{
		IsError:      isError,
		Error:        err,
		StatusString: pr.logAsString(loggerString, err, fields...),
		Progress:     end,
	})

	return err
}

// logAsStrings transforms zap Fields to string
func (pr *Processor) logAsString(msg string, err error, fields ...zapcore.Field) string {
	for _, field := range fields {
		msg += " - " + field.String
	}
	return msg
}

func (pr *Processor) dataForOperation(p merger.Patch, op merger.Operation) (cb ProcessFunc, progress string, complete string, error string, fields []zapcore.Field) {

	switch op.Type() {
	case merger.OpCreateFolder:
		cb = pr.processCreateFolder
		progress = "Creating folder"
		complete = "Created folder"
		error = "Error while creating folder"
		fields = append(fields, zap.String("path", op.GetRefPath()))
	case merger.OpCreateFile, merger.OpUpdateFile:
		cb = pr.processCreateFile
		if p.HasTransfers() {
			progress = "Transferring file"
			complete = "Transferred file"
			error = "Error while transferring file"
		} else {
			progress = "Indexing file"
			complete = "Indexed file"
			error = "Error while indexing file"
		}
		fields = append(fields, zap.String("path", op.GetRefPath()))
	case merger.OpMoveFolder:
		cb = pr.processMove
		progress = "Moving folder"
		complete = "Moved folder"
		error = "Error while moving folder"
		fields = append(fields, zap.String("from", op.GetMoveOriginPath()))
		fields = append(fields, zap.String("to", op.GetRefPath()))
	case merger.OpMoveFile:
		cb = pr.processMove
		progress = "Moving file"
		complete = "Moved file"
		error = "Error while moving file"
		fields = append(fields, zap.String("from", op.GetMoveOriginPath()))
		fields = append(fields, zap.String("to", op.GetRefPath()))
	case merger.OpDelete:
		cb = pr.processDelete
		nS := "folder"
		if op.GetNode().IsLeaf() {
			nS = "file"
		}
		progress = "Deleting " + nS
		complete = "Deleted " + nS
		error = "Error while deleting " + nS
		fields = append(fields, zap.String("path", op.GetRefPath()))
	}
	return
}

// Logger is a shortcut for log.Logger(pr.globalContext) function
func (pr *Processor) Logger() *zap.Logger {
	return log.Logger(pr.GlobalContext)
}