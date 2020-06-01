package actions

import (
	"context"

	"github.com/pydio/cells/common/forms"

	"github.com/pydio/cells/common/etl"
	"github.com/pydio/cells/common/log"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
)

type SyncConfigAction struct {
	etlAction
}

func (c *SyncConfigAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              SyncConfigActionName,
		Label:           "Sync. Configs",
		Icon:            "",
		Description:     "Diff and merge two configuration stores",
		Category:        actions.ActionCategoryETL,
		SummaryTemplate: "",
		HasForm:         true,
	}
}

func (c *SyncConfigAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "left",
					Type:        forms.ParamString,
					Label:       "Left store",
					Description: "Type of left users store",
				},
				&forms.FormField{
					Name:        "right",
					Type:        forms.ParamString,
					Label:       "Right store",
					Description: "Type of right users store",
				},
			},
		},
	}}
}

var (
	SyncConfigActionName = "actions.etl.configs"
)

// GetName returns the unique identifier of this action.
func (c *SyncConfigAction) GetName() string {
	return SyncConfigActionName
}

// Init passes relevant parameters.
func (c *SyncConfigAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	return c.ParseStores(action.Parameters)
}

// Run the actual action code.
func (c *SyncConfigAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	channels.StatusMsg <- "Initializing config list for diff/merge..."
	log.TasksLogger(ctx).Info("Importing configuration")

	progress := make(chan etl.MergeOperation)
	finished := make(chan bool)
	defer close(progress)
	defer close(finished)
	var pgErrors []error

	go func() {
		for {
			select {
			case op := <-progress:
				channels.StatusMsg <- op.Description
				log.TasksLogger(ctx).Info(op.Description)
				if op.Total > 0 {
					channels.Progress <- float32(op.Cursor) / float32(op.Total)
				}

				if op.Error != nil {
					pgErrors = append(pgErrors, op.Error)
				}
			case <-finished:
				return
			}
		}
	}()

	defer func() {
		finished <- true
	}()

	merger, err := c.initMerger(ctx, input)
	if err != nil {
		return input.WithError(err), err
	}

	defer merger.Close()

	diff, err := merger.LoadAndDiffConfig(ctx)
	if err != nil {
		return input.WithError(err), err
	}

	merger.Save(ctx, diff, progress)

	log.TasksLogger(ctx).Info("Successfully synced config")
	output := input
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Successfully synced config",
	})

	var gE error
	if len(pgErrors) > 0 {
		gE = pgErrors[0]
		for _, err := range pgErrors {
			output = output.WithError(err)
		}
	}
	return output, gE
}
