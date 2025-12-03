package api

import (
	"backend/auth"
	"backend/config"
	"net/http"
)

var GetVersion = MakeHandlerFunc(func(req *http.Request) (int, any) {
	return http.StatusOK, config.Version
})

var GetProfile = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)

	if user == nil {
		return http.StatusForbidden, http.StatusText(http.StatusForbidden)
	}

	return http.StatusOK, user
})
