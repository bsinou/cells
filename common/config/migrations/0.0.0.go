package migrations

import (
	"fmt"
	"strings"

	"github.com/hashicorp/go-version"
	"github.com/ory/hydra/x"
	"github.com/pydio/cells/common"
)

func init() {
	initialVersion, _ := version.NewVersion("0.0.0")
	add(initialVersion, getMigration(renameKeys))
	add(initialVersion, getMigration(setDefaultConfig))
	add(initialVersion, getMigration(forceDefaultConfig))
	// add(&migrations.Migration{TargetVersion: common.Version(), Up: getMigration(updateLeCaURL)})
}

func renameKeys(config common.ConfigValues) (bool, error) {
	return UpdateKeys(config, map[string]string{
		"services/pydio.api.websocket":            "services/" + common.SERVICE_GATEWAY_NAMESPACE_ + common.SERVICE_WEBSOCKET,
		"services/pydio.grpc.gateway.data":        "services/" + common.SERVICE_GATEWAY_DATA,
		"services/pydio.grpc.gateway.proxy":       "services/" + common.SERVICE_GATEWAY_PROXY,
		"services/pydio.rest.gateway.dav":         "services/" + common.SERVICE_GATEWAY_DAV,
		"services/pydio.rest.gateway.wopi":        "services/" + common.SERVICE_GATEWAY_WOPI,
		"ports/micro.api":                         "ports/" + common.SERVICE_MICRO_API,
		"services/micro.api":                      "services/" + common.SERVICE_MICRO_API,
		"services/pydio.api.front-plugins":        "services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_FRONT_STATICS,
		"services/pydio.grpc.auth/dex/connectors": "services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH + "/connectors",
	})
}

func setDefaultConfig(config common.ConfigValues) (bool, error) {
	var save bool

	oauthSrv := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	secret, err := x.GenerateSecret(32)
	if err != nil {
		return false, err
	}
	var syncRedirects = []string{
		"http://localhost:3000/servers/callback", // SYNC UX DEBUG PORT
		"http://localhost:[3636-3666]/servers/callback",
	}
	external := config.Values("defaults/url").Default("").String()
	oAuthFrontendConfig := map[string]interface{}{
		"client_id":                 "cells-frontend",
		"client_name":               "CellsFrontend Application",
		"grant_types":               []string{"authorization_code", "refresh_token"},
		"redirect_uris":             []string{external + "/auth/callback"},
		"post_logout_redirect_uris": []string{external + "/auth/logout"},
		"response_types":            []string{"code", "token", "id_token"},
		"scope":                     "openid email profile pydio offline",
	}
	oAuthSyncConfig := map[string]interface{}{
		"client_id":      "cells-sync",
		"client_name":    "CellsSync Application",
		"grant_types":    []string{"authorization_code", "refresh_token"},
		"redirect_uris":  syncRedirects,
		"response_types": []string{"code", "token", "id_token"},
		"scope":          "openid email profile pydio offline",
	}

	oAuthCecConfig := map[string]interface{}{
		"client_id":   "cells-client",
		"client_name": "Cells Client CLI Tool",
		"grant_types": []string{"authorization_code", "refresh_token"},
		"redirect_uris": []string{
			"http://localhost:3000/servers/callback",
			external + "/oauth2/oob",
		},
		"response_types": []string{"code", "token", "id_token"},
		"scope":          "openid email profile pydio offline",
	}
	oAuthMobileConfig := map[string]interface{}{
		"client_id":   "cells-mobile",
		"client_name": "Mobile Applications",
		"grant_types": []string{"authorization_code", "refresh_token"},
		"redirect_uris": []string{
			"cellsauth://callback",
		},
		"response_types": []string{"code", "token", "id_token"},
		"scope":          "openid email profile pydio offline",
	}
	configKeys := map[string]interface{}{
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_HOST": "localhost",
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_PORT": "9980",
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_SSL":  true,
		"services/" + oauthSrv + "/cors/public": map[string]interface{}{
			"allowedOrigins": "*",
		},
		"services/" + oauthSrv + "/secret": string(secret),
		"services/" + oauthSrv + "/staticClients": []map[string]interface{}{
			oAuthFrontendConfig,
			oAuthSyncConfig,
			oAuthCecConfig,
			oAuthMobileConfig,
		},
	}

	for path, def := range configKeys {
		val := config.Values(path)
		var data interface{}

		if e := val.Scan(&data); e == nil && data == nil {
			fmt.Printf("[Configs] Upgrading: setting default config %s to %v\n", path, def)
			val.Set(def)
			save = true
		}
	}

	return save, nil
}

func forceDefaultConfig(config common.ConfigValues) (bool, error) {
	var save bool
	oauthSrv := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	external := config.Values("defaults/url").Default("").String()

	// Easy finding usage of srvUrl
	configKeys := map[string]interface{}{
		"services/" + oauthSrv + "/issuer": external + "/oidc/",
	}

	for path, def := range configKeys {
		val := config.Values(path)
		var data interface{}
		if val.Scan(&data); data != def {
			fmt.Printf("[Configs] Upgrading: forcing default config %s to %v\n", path, def)
			val.Set(def)
			save = true
		}
	}

	configSliceKeys := map[string][]string{
		"services/" + oauthSrv + "/insecureRedirects": []string{external + "/auth/callback"},
	}

	for path, def := range configSliceKeys {
		val := config.Values(path)

		var data []string
		if val.Scan(&data); !stringSliceEqual(data, def) {
			fmt.Printf("[Configs] Upgrading: forcing default config %s to %v\n", path, def)
			val.Set(def)
			save = true
		}
	}

	oAuthFrontendConfig := map[string]interface{}{
		"client_id":                 "cells-frontend",
		"client_name":               "CellsFrontend Application",
		"grant_types":               []string{"authorization_code", "refresh_token"},
		"redirect_uris":             []string{external + "/auth/callback"},
		"post_logout_redirect_uris": []string{external + "/auth/logout"},
		"response_types":            []string{"code", "token", "id_token"},
		"scope":                     "openid email profile pydio offline",
	}

	// Special case for srvUrl/oauth2/oob url
	statics := config.Values("services/" + oauthSrv + "staticClients")
	var data []map[string]interface{}
	if err := statics.Scan(&data); err == nil {
		var saveStatics bool
		var addCellsFrontend = true
		for _, static := range data {
			if clientID, ok := static["client_id"].(string); addCellsFrontend && ok {
				if clientID == "cells-frontend" {
					addCellsFrontend = false
				}
			}

			for _, n := range []string{"redirect_uris", "post_logout_redirect_uris"} {
				if redirs, ok := static[n].([]interface{}); ok {
					var newRedirs []string
					for _, redir := range redirs {
						if strings.HasSuffix(redir.(string), "/oauth2/oob") && redir.(string) != external+"/oauth2/oob" {
							newRedirs = append(newRedirs, external+"/oauth2/oob")
							saveStatics = true
						} else if strings.HasSuffix(redir.(string), "/auth/callback") && redir.(string) != external+"/auth/callback" {
							newRedirs = append(newRedirs, external+"/auth/callback")
							saveStatics = true
						} else if strings.HasSuffix(redir.(string), "/auth/logout") && redir.(string) != external+"/auth/logout" {
							newRedirs = append(newRedirs, external+"/auth/logout")
							saveStatics = true
						} else {
							newRedirs = append(newRedirs, redir.(string))
						}
					}
					static[n] = newRedirs
				}
			}
		}
		if addCellsFrontend {
			data = append([]map[string]interface{}{oAuthFrontendConfig}, data...)
			saveStatics = true
		}
		if saveStatics {
			fmt.Println("[Configs] Upgrading: updating staticClients")
			config.Values("services/" + oauthSrv + "staticClients").Set(data)
			save = true
		}
	}

	return save, nil
}

// // updateLeCaURL changes the URL of acme API endpoint for Let's Encrypt certificate generation to v2 if it is used.
// func updateLeCaURL(config common.ConfigValues) (bool, error) {

// 	caURLKey := "cert/proxy/caUrl"
// 	caURLOldValue := "https://acme-v01.api.letsencrypt.org/directory"
// 	caURLNewValue := "https://acme-v02.api.letsencrypt.org/directory"

// 	paths := strings.Split(caURLKey, "/")
// 	val := config.Get(paths...)

// 	var data interface{}
// 	save := false
// 	if e := val.Scan(&data); e == nil && data != nil {
// 		ov := data.(string)
// 		if ov == caURLOldValue {
// 			fmt.Printf("[Configs] Upgrading: rather use acme v2 API to generate Let's Encrypt certificates\n")
// 			config.Set(caURLNewValue, paths...)
// 			save = true
// 		}
// 	}
// 	return save, nil
// }
