package merger

import (
	"path"
	"sort"
	"strings"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/mtree"
	"go.uber.org/zap/zapcore"
)

const (
	maxUint = ^uint(0)
	maxInt  = int(maxUint >> 1)
)

type Move struct {
	deleteEvent *Operation
	createEvent *Operation
	dbNode      *tree.Node
}

// ByAge implements sort.Interface based on the Age field.
type bySourceDeep []*Move

func (a bySourceDeep) Len() int { return len(a) }
func (a bySourceDeep) folderDepth(m *Move) int {
	return len(strings.Split(strings.Trim(m.deleteEvent.Key, "/"), "/"))
}
func (a bySourceDeep) Less(i, j int) bool {
	return a.folderDepth(a[i]) > a.folderDepth(a[j])
}
func (a bySourceDeep) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func (m *Move) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if m == nil {
		return nil
	}
	encoder.AddString("From", m.deleteEvent.Key)
	encoder.AddString("To", m.createEvent.Key)
	encoder.AddObject("DbNode", m.dbNode)
	return nil
}

func (m *Move) Distance() int {
	sep := "/"
	if m.deleteEvent.Key == m.createEvent.Key {
		return maxInt
	}
	pref := mtree.CommonPrefix(sep[0], m.deleteEvent.Key, m.createEvent.Key)
	return len(strings.Split(pref, sep))
}

func (m *Move) SameBase() bool {
	return path.Base(m.deleteEvent.Key) == path.Base(m.createEvent.Key)
}

func sortClosestMoves(possibleMoves []*Move) (moves []*Move) {

	// Dedup by source
	greatestSource := make(map[string]*Move)
	targets := make(map[string]bool)
	sort.Sort(bySourceDeep(possibleMoves))
	for _, m := range possibleMoves {
		source := m.deleteEvent.Key
		for _, m2 := range possibleMoves {
			byT, ok := greatestSource[source]
			source2 := m2.deleteEvent.Key
			target2 := m2.createEvent.Key
			if source2 != source {
				continue
			}
			if _, alreadyUsed := targets[target2]; alreadyUsed {
				continue
			}
			if !ok || m2.Distance() > byT.Distance() || m2.SameBase() && !byT.SameBase() {
				greatestSource[source] = m2
			}
		}
		if m, ok := greatestSource[source]; ok {
			targets[m.createEvent.Key] = true
		}
	}

	// Dedup by target
	greatestTarget := make(map[string]*Move)
	for _, m := range greatestSource {
		byT, ok := greatestTarget[m.createEvent.Key]
		if !ok || m.Distance() > byT.Distance() {
			greatestTarget[m.createEvent.Key] = m
		}
	}

	for _, m := range greatestTarget {
		moves = append(moves, m)
	}

	return
}