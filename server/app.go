package main

import (
	"backend/api"
	"backend/auth"
	"io/fs"
	"log/slog"
	"os"
	"strings"

	"embed"
	"net/http"
	"net/http/httputil"
	"net/url"

	oav "gitlab.com/ggpack/openapi-validation-go"
)

//go:embed swagger-ui
var content embed.FS

func logReqMdw(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		if req.RequestURI != "/api/version" && !strings.HasPrefix(req.RequestURI, "/src/") { // Kludge for healthcheck not spamming
			slog.Info("New request on", "endpoint", "\033[34;1m"+req.Method+" "+req.RequestURI+"\033[0m")
		}
		next.ServeHTTP(res, req)
	})
}

func newApp() http.Handler {

	rootMux := http.NewServeMux()

	var uiHandler http.Handler
	if os.Getenv("DEV_MODE") == "true" {
		uiHandler = httputil.NewSingleHostReverseProxy(&url.URL{Scheme: "http", Host: "client-dev-server:3000"})
		slog.Info("🔥 dev mode")
	} else {
		uiHandler = http.FileServer(http.Dir("../client/dist"))
	}
	rootMux.Handle("/", uiHandler)

	authMux := http.NewServeMux()
	rootMux.Handle("/.auth/", http.StripPrefix("/.auth", authMux))
	authMux.HandleFunc("GET /success", auth.GetSuccess)
	authMux.HandleFunc("GET /login", auth.Login)
	authMux.HandleFunc("/logout", auth.Logout)

	apiMux := http.NewServeMux()
	shortApiHandler := http.StripPrefix("/api", apiMux)
	rootMux.Handle("/api/", auth.SessionToUserMdw(shortApiHandler)) // Protected by authentication && inputs validation

	swaggerFS, _ := fs.Sub(content, "swagger-ui")
	oav.RegisterAndValidateInputsMdw(apiMux, api.Handlers, swaggerFS, auth.InputsValidationCallback)

	return logReqMdw(rootMux)
}
