package handlers

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

// Simple interface to implement to handle requests
type ServiceFunc func(*http.Request) (int, any)

// Wraps the ServiceFunc to manke a http.HandlerFunc with panic handling and JSON response encoding
func MakeHandlerFunc(svcFunc ServiceFunc) http.HandlerFunc {

	return func(res http.ResponseWriter, req *http.Request) {

		code, body := func(req *http.Request) (code int, body any) {
			// General panic/error handler to keep the server up
			defer func() {
				if recoveredPanic := recover(); recoveredPanic != nil {
					slog.Warn("Recovering", "panic", recoveredPanic)
					// Using the named return values for update in @defer time
					code = http.StatusInternalServerError
					body = http.StatusText(code)
				}
			}()
			return svcFunc(req)
		}(req)

		// Single response
		res.Header().Set("content-type", "application/json")
		res.WriteHeader(code)
		json.NewEncoder(res).Encode(body)
	}
}
