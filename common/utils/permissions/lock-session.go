package permissions

import (
	"context"
	"time"

	"github.com/pydio/cells/common/log"

	"github.com/pydio/cells/common/proto/tree"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/registry"
	service "github.com/pydio/cells/common/service/proto"
)

type SessionLocker interface {
	Lock(ctx context.Context) error
	UpdateExpiration(ctx context.Context, expireAfter time.Duration) error
	Unlock(ctx context.Context) error
	AddChildTarget(parentUUID, targetChildName string)
}

type LockSession struct {
	nodeUUID    string
	sessionUUID string
	expireAfter time.Duration

	targetParentUuid string
	targetChildName  string
}

// NewLockSession creates a new LockSession object
func NewLockSession(nodeUUID, sessionUUID string, expireAfter time.Duration) *LockSession {
	return &LockSession{
		nodeUUID:    nodeUUID,
		sessionUUID: sessionUUID,
		expireAfter: expireAfter,
	}
}

func (l *LockSession) AddChildTarget(parentUUID, targetChildName string) {
	l.targetParentUuid = parentUUID
	l.targetChildName = targetChildName
}

// Lock sets an expirable lock ACL on the NodeUUID with SessionUUID as value
func (l *LockSession) Lock(ctx context.Context) error {

	aclClient := idm.NewACLServiceClient(registry.GetClient(common.SERVICE_ACL))

	if l.nodeUUID != "" {
		lock := &idm.ACLAction{Name: AclLock.Name, Value: l.sessionUUID}
		if err := l.create(ctx, aclClient, l.nodeUUID, lock); err != nil {
			return err
		}
		if err := l.updateExpiration(ctx, aclClient, l.nodeUUID, lock, l.expireAfter); err != nil {
			return err
		}
	}

	if l.targetParentUuid != "" && l.targetChildName != "" {
		childLock := &idm.ACLAction{Name: AclChildLock.Name + ":" + l.targetChildName, Value: l.sessionUUID}
		if err := l.create(ctx, aclClient, l.targetParentUuid, childLock); err != nil {
			return err
		}
		if err := l.updateExpiration(ctx, aclClient, l.targetParentUuid, childLock, l.expireAfter); err != nil {
			return err
		}
	}

	return nil

}

// UpdateExpiration set a new expiration date on the current lock
func (l *LockSession) UpdateExpiration(ctx context.Context, expireAfter time.Duration) error {

	aclClient := idm.NewACLServiceClient(registry.GetClient(common.SERVICE_ACL))
	if l.nodeUUID != "" {
		searchLock := &idm.ACLAction{Name: AclLock.Name, Value: l.sessionUUID}
		if err := l.updateExpiration(ctx, aclClient, l.nodeUUID, searchLock, expireAfter); err != nil {
			return err
		}
	}

	if l.targetParentUuid != "" && l.targetChildName != "" {
		childLock := &idm.ACLAction{Name: AclChildLock.Name + ":" + l.targetChildName, Value: l.sessionUUID}
		return l.updateExpiration(ctx, aclClient, l.targetParentUuid, childLock, expireAfter)
	}

	return nil

}

// Unlock manually removes the ACL
func (l *LockSession) Unlock(ctx context.Context) error {

	aclClient := idm.NewACLServiceClient(registry.GetClient(common.SERVICE_ACL))
	err1 := l.remove(ctx, aclClient, &idm.ACLAction{Name: AclLock.Name, Value: l.sessionUUID})
	err2 := l.remove(ctx, aclClient, &idm.ACLAction{Name: AclChildLock.Name + ":*", Value: l.sessionUUID})
	if err1 != nil {
		return err1
	} else if err2 != nil {
		return err1
	} else {
		return nil
	}
}

func (l *LockSession) create(ctx context.Context, cli idm.ACLServiceClient, nodeUUID string, action *idm.ACLAction) error {

	_, err := cli.CreateACL(ctx, &idm.CreateACLRequest{
		ACL: &idm.ACL{
			NodeID: nodeUUID,
			Action: action,
		},
	})
	return err

}

func (l *LockSession) remove(ctx context.Context, cli idm.ACLServiceClient, action *idm.ACLAction) error {

	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{action},
	})

	_, err := cli.DeleteACL(ctx, &idm.DeleteACLRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{q},
		},
	})
	return err

}

func (l *LockSession) updateExpiration(ctx context.Context, cli idm.ACLServiceClient, nodeUUID string, action *idm.ACLAction, expireAfter time.Duration) error {

	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{action},
		NodeIDs: []string{nodeUUID},
	})

	_, err := cli.ExpireACL(ctx, &idm.ExpireACLRequest{
		Query: &service.Query{
			SubQueries: []*any.Any{q},
		},
		Timestamp: time.Now().Add(expireAfter).Unix(),
	})
	return err
}

func HasChildLocks(ctx context.Context, node *tree.Node) bool {
	aclClient := idm.NewACLServiceClient(registry.GetClient(common.SERVICE_ACL))
	q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
		Actions: []*idm.ACLAction{{Name: AclChildLock.Name + ":*"}},
		NodeIDs: []string{node.GetUuid()},
	})
	if st, e := aclClient.SearchACL(ctx, &idm.SearchACLRequest{Query: &service.Query{SubQueries: []*any.Any{q}}}); e == nil {
		defer st.Close()
		for {
			_, er := st.Recv()
			if er != nil {
				break
			}
			log.Logger(ctx).Info("Found childLock on ", node.Zap())
			return true
		}
	}
	log.Logger(ctx).Info("No childLock on ", node.Zap())
	return false
}
