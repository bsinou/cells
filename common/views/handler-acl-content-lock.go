/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package views

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
)

type AclContentLockFilter struct {
	AbstractHandler
}

func (a *AclContentLockFilter) MultipartCreate(ctx context.Context, target *tree.Node, requestData *MultipartRequestData) (string, error) {
	if branchInfo, ok := GetBranchInfo(ctx, "in"); ok && branchInfo.Binary {
		return a.next.MultipartCreate(ctx, target, requestData)
	}
	if err := permissions.CheckContentLock(ctx, target); err != nil {
		return "", err
	}
	return a.next.MultipartCreate(ctx, target, requestData)
}

// CopyObject should check: quota on CopyObject operation? Can we copy an object on top of an existing node?
func (a *AclContentLockFilter) CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error) {
	return a.next.CopyObject(ctx, from, to, requestData)
}

func (a *AclContentLockFilter) WrappedCanApply(srcCtx context.Context, targetCtx context.Context, operation *tree.NodeChangeEvent) error {
	var lockErr error
	switch operation.GetType() {
	case tree.NodeChangeEvent_CREATE:
		lockErr = permissions.CheckContentLock(targetCtx, operation.GetTarget())
	case tree.NodeChangeEvent_DELETE, tree.NodeChangeEvent_UPDATE_PATH:
		lockErr = permissions.CheckContentLock(srcCtx, operation.GetSource())
	}
	if lockErr != nil {
		return lockErr
	}
	return a.next.WrappedCanApply(srcCtx, targetCtx, operation)
}
