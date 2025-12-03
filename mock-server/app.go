package main

import (
	"embed"
	"html/template"
	"log/slog"
	"net/http"

	"auth-server/handlers"
)

//go:embed templates
var allFS embed.FS
var allTemplates = template.Must(template.New("").ParseFS(allFS, "templates/*"))

func logReq(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		slog.Info("New request on", "endpoint", "\033[35;1m"+req.Method+" "+req.RequestURI+"\033[0m")
		next.ServeHTTP(res, req)
	})
}

func newApp() http.Handler {

	rootMux := http.NewServeMux()
	authMux := http.NewServeMux()
	rootMux.Handle("/auth/", http.StripPrefix("/auth", authMux))

	// Called when a user tries to login
	authMux.HandleFunc("GET /login", func(res http.ResponseWriter, req *http.Request) {
		allTemplates.ExecuteTemplate(res, "login.html", nil)
	})

	// Called when a user tries to logout
	authMux.HandleFunc("GET /logout", func(res http.ResponseWriter, req *http.Request) {
		redirect_uri := req.URL.Query().Get("redirect_uri")
		http.Redirect(res, req, redirect_uri, http.StatusTemporaryRedirect)
	})

	// Called when a login happens
	authMux.HandleFunc("POST /login", handlers.PostLogin)

	// Called to retrieve the JWTs
	authMux.HandleFunc("POST /oauth2/token", handlers.PostToken)

	apiMux := http.NewServeMux()
	rootMux.Handle("/api/", http.StripPrefix("/api", apiMux))

	apiMux.HandleFunc("GET /responses", handlers.ListResponses)
	apiMux.HandleFunc("POST /responses", handlers.PostResponse)
	apiMux.HandleFunc("DELETE /responses", handlers.DeleteResponses)
	apiMux.HandleFunc("GET /responses/{respId}", handlers.GetOneResponse)
	apiMux.HandleFunc("DELETE /responses/{respId}", handlers.DeleteOneResponse)

	rootMux.Handle("/mock/", http.StripPrefix("/mock", http.HandlerFunc(handlers.MatchMockResponse)))

	return logReq(rootMux)
}
