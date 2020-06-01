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

package rest

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"strconv"
	"strings"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/metadata"
	"github.com/pborman/uuid"
	"github.com/scottleedavis/go-exif-remove"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	pauth "github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/common/service/resources"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
)

const (
	avatarDefaultMaxSize = 5 * 1024 * 1024
)

type FrontendHandler struct {
	resources.ResourceProviderHandler
}

func NewFrontendHandler() *FrontendHandler {
	f := &FrontendHandler{}
	return f
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *FrontendHandler) SwaggerTags() []string {
	return []string{"FrontendService"}
}

// Filter returns a function to filter the swagger path
func (a *FrontendHandler) Filter() func(string) string {
	return nil
}

func (a *FrontendHandler) FrontState(req *restful.Request, rsp *restful.Response) {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	ctx := req.Request.Context()

	user := &frontend.User{}
	if e := user.Load(ctx); e != nil {
		service.RestError500(req, rsp, e)
		return
	}

	user.LoadActiveWorkspace(req.QueryParameter("ws"))
	lang := user.LoadActiveLanguage(req.QueryParameter("lang"))

	cfg := config.Default()
	rolesConfigs := user.FlattenedRolesConfigs()

	status := frontend.RequestStatus{
		Config:        cfg,
		AclParameters: rolesConfigs.Get("parameters").(*config.Map),
		AclActions:    rolesConfigs.Get("actions").(*config.Map),
		WsScopes:      user.GetActiveScopes(),
		User:          user,
		NoClaims:      !user.Logged,
		Lang:          lang,
		Request:       req.Request,
	}
	registry := pool.RegistryForStatus(ctx, status)
	rsp.WriteAsXml(registry)
}

// FrontBootConf loads an open JSON struct for start configuration. As it can be called
// directly as a simple GET /a/frontend/bootconf, this endpoint can rely on Cookie for authentication
func (a *FrontendHandler) FrontBootConf(req *restful.Request, rsp *restful.Response) {

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	showVersion := false
	user := &frontend.User{}
	if e := user.Load(req.Request.Context()); e == nil && user.Logged {
		showVersion = true
	}
	bootConf := frontend.ComputeBootConf(pool, showVersion)
	rsp.WriteAsJson(bootConf)

}

// FrontPlugins dumps a full list of available frontend plugins
func (a *FrontendHandler) FrontPlugins(req *restful.Request, rsp *restful.Response) {

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}

	lang := req.QueryParameter("lang")
	if lang == "" {
		user := &frontend.User{}
		if e := user.Load(req.Request.Context()); e == nil {
			if l := user.LoadActiveLanguage(""); l != "" {
				lang = l
			}
		}
	}
	if lang == "" {
		lang = "en-us"
	}
	plugins := pool.AllPluginsManifests(req.Request.Context(), lang)
	rsp.WriteAsXml(plugins)
}

// FrontSessionGet loads a cookie-based session to get info about an access token
func (a *FrontendHandler) FrontSessionGet(req *restful.Request, rsp *restful.Response) {
	sessionName := "pydio"
	if h := req.HeaderParameter("X-Pydio-Minisite"); h != "" {
		sessionName = sessionName + "-" + h
	}

	session, err := frontend.GetSessionStore(req.Request).Get(req.Request, sessionName)
	if err != nil && session == nil {
		service.RestError500(req, rsp, fmt.Errorf("could not load session store: %s", err))
		return
	}

	response := &rest.FrontSessionGetResponse{}
	if len(session.Values) > 0 {
		response.Token = &pauth.Token{
			AccessToken: session.Values["access_token"].(string),
			IDToken:     session.Values["id_token"].(string),
			ExpiresAt:   session.Values["expires_at"].(string),
		}
	}

	rsp.WriteEntity(response)
}

// FrontSession initiate a cookie-based session based on a LoginRequest
func (a *FrontendHandler) FrontSession(req *restful.Request, rsp *restful.Response) {

	var loginRequest rest.FrontSessionRequest
	if e := req.ReadEntity(&loginRequest); e != nil {
		service.RestError500(req, rsp, e)
		return
	}

	ctx := req.Request.Context()
	if loginRequest.AuthInfo == nil {
		loginRequest.AuthInfo = map[string]string{}
	}

	sessionName := "pydio"
	if h := req.HeaderParameter("X-Pydio-Minisite"); h != "" {
		sessionName = sessionName + "-" + h
	}

	session, err := frontend.GetSessionStore(req.Request).Get(req.Request, sessionName)
	if err != nil && session == nil {
		service.RestError500(req, rsp, fmt.Errorf("could not load session store: %s", err))
		return
	}

	response := &rest.FrontSessionResponse{}
	if e := frontend.ApplyAuthMiddlewares(req, rsp, &loginRequest, response, session); e != nil {
		if e := session.Save(req.Request, rsp.ResponseWriter); e != nil {
			log.Logger(ctx).Error("Error saving session", zap.Error(e))
		}
		service.RestError401(req, rsp, e)
		return
	}

	if response.Error != "" {
		service.RestError401(req, rsp, errors.New(response.Error))
		return
	}

	if e := session.Save(req.Request, rsp.ResponseWriter); e != nil {
		log.Logger(ctx).Error("Error saving session", zap.Error(e))
	}

	// Legacy code
	if accessToken, ok := session.Values["access_token"]; ok {
		response.JWT = accessToken.(string)
	}

	if expiry, ok := session.Values["expires_at"]; ok {
		if expiryInt, err := strconv.Atoi(expiry.(string)); err == nil {
			response.ExpireTime = int32(expiryInt)
		}
	}

	rsp.WriteEntity(response)
}

// FrontendSessionDel logs out user by clearing the associated cookie session.
func (a *FrontendHandler) FrontSessionDel(req *restful.Request, rsp *restful.Response) {

	sessionName := "pydio"
	if h := req.HeaderParameter("X-Pydio-Minisite"); h != "" {
		sessionName = sessionName + "-" + h
	}

	session, err := frontend.GetSessionStore(req.Request).Get(req.Request, sessionName)
	if err != nil && session == nil {
		service.RestError500(req, rsp, fmt.Errorf("could not load session store: %s", err))
		return
	}

	session.Values = make(map[interface{}]interface{})
	session.Options.MaxAge = -1
	session.Save(req.Request, rsp.ResponseWriter)

	rsp.WriteEntity(nil)
}

// Generic endpoint that can be handled by specific 2FA plugins
func (a *FrontendHandler) FrontEnrollAuth(req *restful.Request, rsp *restful.Response) {
	frontend.ApplyEnrollMiddlewares("FrontEnrollAuth", req, rsp)
}

// FrontMessages loads all i18n messages for a given language
func (a *FrontendHandler) FrontMessages(req *restful.Request, rsp *restful.Response) {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	lang := req.PathParameter("Lang")
	rsp.WriteAsJson(pool.I18nMessages(lang).Messages)
}

// Strip Cookies Metadata from context to avoid s3 too-long-header error
func ctxWithoutCookies(ctx context.Context) context.Context {

	if meta, ok := metadata.FromContext(ctx); ok {
		newMeta := map[string]string{}
		for k, v := range meta {
			if k != "CookiesString" {
				newMeta[k] = v
			}
		}
		return metadata.NewContext(ctx, newMeta)
	} else {
		return ctx
	}
}

// FrontServeBinary triggers the download of a stored binary.
// As it can be used directly in <img url="/a/frontend/binary">, this endpoint can rely
// on the cookie to authenticate user
func (a *FrontendHandler) FrontServeBinary(req *restful.Request, rsp *restful.Response) {

	binaryType := req.PathParameter("BinaryType")
	binaryUuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()

	router := views.NewStandardRouter(views.RouterOptions{WatchRegistry: false})
	var readNode *tree.Node
	var extension string

	if binaryType == "USER" {

		user, e := permissions.SearchUniqueUser(ctx, binaryUuid, "")
		if e != nil {
			service.RestError404(req, rsp, e)
			return
		}
		if avatarId, ok := user.Attributes["avatar"]; ok {

			readNode = &tree.Node{
				Path: common.PYDIO_DOCSTORE_BINARIES_NAMESPACE + "/users_binaries." + user.Login + "-" + avatarId,
			}
			extension = strings.Split(avatarId, ".")[1]
		}
	} else if binaryType == "GLOBAL" {

		readNode = &tree.Node{
			Path: common.PYDIO_DOCSTORE_BINARIES_NAMESPACE + "/global_binaries." + binaryUuid,
		}
		if strings.Contains(binaryUuid, ".") {
			extension = strings.Split(binaryUuid, ".")[1]
		}
	}

	if readNode != nil {
		// If anonymous GET, add system user in context before querying object service
		if ctxUser, _ := permissions.FindUserNameInContext(ctx); ctxUser == "" {
			ctx = context.WithValue(ctx, common.PYDIO_CONTEXT_USER_KEY, common.PYDIO_SYSTEM_USERNAME)
		}
		ctx = ctxWithoutCookies(ctx)
		if req.QueryParameter("dim") != "" {
			if dim, e := strconv.ParseInt(req.QueryParameter("dim"), 10, 32); e == nil {
				if e := readBinary(ctx, router, readNode, rsp.ResponseWriter, rsp.Header(), extension, int(dim)); e != nil {
					service.RestError500(req, rsp, e)
				}
				return
			}
		}
		readBinary(ctx, router, readNode, rsp.ResponseWriter, rsp.Header(), extension)
	}
}

// FrontPutBinary receives an upload to store a binary.
func (a *FrontendHandler) FrontPutBinary(req *restful.Request, rsp *restful.Response) {

	binaryType := req.PathParameter("BinaryType")
	binaryUuid := req.PathParameter("Uuid")
	ctx := req.Request.Context()

	if e := req.Request.ParseForm(); e != nil {
		service.RestError500(req, rsp, e)
		return
	}
	var fileInput io.Reader
	var fileSize int64
	f1, f2, e1 := req.Request.FormFile("userfile")
	if e1 != nil {
		service.RestError500(req, rsp, e1)
		return
	}
	fileInput = f1
	fileSize = f2.Size

	cType := strings.Split(f2.Header.Get("Content-Type"), "/")
	extension := cType[1]
	binaryId := uuid.New()[0:12] + "." + extension
	ctxUser, ctxClaims := permissions.FindUserNameInContext(ctx)

	log.Logger(ctx).Debug("Upload Binary", zap.String("type", binaryType), zap.Any("header", f2))
	router := views.NewStandardRouter(views.RouterOptions{WatchRegistry: false})
	ctx = ctxWithoutCookies(ctx)

	defer f1.Close()

	if binaryType == "USER" {

		if f2.Size > avatarDefaultMaxSize {
			service.RestError403(req, rsp, fmt.Errorf("you are not allowed to use files bigger than %dB for avatars", avatarDefaultMaxSize))
			return
		}
		// Load data in-memory to check and remove EXIF data if there are any
		data, er := ioutil.ReadAll(fileInput)
		if er != nil {
			service.RestError500(req, rsp, er)
			return
		}
		filtered, er := exifremove.Remove(data)
		if er != nil {
			service.RestError500(req, rsp, er)
			return
		}
		// Use filtered data instead of original
		fileInput = bytes.NewBuffer(filtered)
		fileSize = int64(len(filtered))
		// USER binaries can only be edited by context user or by admin
		if ctxClaims.Profile != common.PYDIO_PROFILE_ADMIN && ctxUser != binaryUuid {
			service.RestError401(req, rsp, fmt.Errorf("you are not allowed to edit this binary"))
			return
		}

		user, e := permissions.SearchUniqueUser(ctx, binaryUuid, "")
		if e != nil {
			service.RestError404(req, rsp, e)
			return
		}
		if !a.IsContextEditable(ctx, user.Uuid, user.Policies) {
			service.RestError403(req, rsp, e)
			return
		}

		node := &tree.Node{
			Path: common.PYDIO_DOCSTORE_BINARIES_NAMESPACE + "/users_binaries." + binaryUuid + "-" + binaryId,
		}

		if user.Attributes != nil {
			if av, ok := user.Attributes["avatar"]; ok && av != "" {
				// There is an existing avatar, remove it
				oldNode := &tree.Node{
					Path: common.PYDIO_DOCSTORE_BINARIES_NAMESPACE + "/users_binaries." + binaryUuid + "-" + av,
				}
				if _, e = router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: oldNode}); e != nil {
					log.Logger(ctx).Error("Error while deleting existing binary", node.Zap(), zap.Error(e))
				}
			}
		}

		_, e = router.PutObject(ctx, node, fileInput, &views.PutRequestData{
			Size: fileSize,
		})
		if e != nil {
			service.RestError500(req, rsp, e)
			return
		}

		if user.Attributes == nil {
			user.Attributes = map[string]string{}
		}
		user.Attributes["avatar"] = binaryId
		cli := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
		_, e = cli.CreateUser(ctx, &idm.CreateUserRequest{User: user})
		if e != nil {
			service.RestError404(req, rsp, e)
			return
		}
	} else if binaryType == "GLOBAL" {

		router := views.NewStandardRouter(views.RouterOptions{WatchRegistry: false})
		node := &tree.Node{
			Path: common.PYDIO_DOCSTORE_BINARIES_NAMESPACE + "/global_binaries." + binaryId,
		}
		if _, e := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node}); e != nil {
			log.Logger(ctx).Error("Error while deleting existing binary", node.Zap(), zap.Error(e))
		}

		_, e := router.PutObject(ctx, node, fileInput, &views.PutRequestData{
			Size: fileSize,
		})
		if e != nil {
			service.RestError500(req, rsp, e)
			return
		}

	} else {

		service.RestError500(req, rsp, fmt.Errorf("unsupported Binary Type (must be USER or GLOBAL)"))
		return

	}

	rsp.WriteAsJson(map[string]string{"binary": binaryId})

}

// SettingsMenu builds the list of available page for the Cells Console left menu
func (a *FrontendHandler) SettingsMenu(req *restful.Request, rsp *restful.Response) {

	rsp.WriteEntity(settingsNode)

}
