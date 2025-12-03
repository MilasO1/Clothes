package main

import (
	"log"
	"log/slog"
	"net/http"

	"gitlab.com/ggpack/logchain-go/v2"
)

func main() {

	params := logchain.Params{
		"seed": []byte("seed"),
	}

	options := logchain.Options{Secret: []byte("secu"), SigLength: 0, Formatter: logchain.TextFormatter{}}

	logger := logchain.NewLogger(params, &options)
	slog.SetDefault(logger)

	slog.Info("Starting the auth server.")

	app := newApp()

	server := http.Server{
		Addr:    "0.0.0.0:8081",
		Handler: app,
	}

	slog.Info("HTTP server listening", "address", server.Addr)
	log.Fatal(server.ListenAndServe())
}
