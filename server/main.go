package main

import (
	"backend/config"
	"backend/db"
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

	slog.Info("Starting the api server.", "version", config.Version)

	app := newApp()

	closer, err := db.InitConnection()

	if closer != nil {
		defer closer()
	}

	if err != nil {
		log.Fatal("Could not connect to the DB", err)
	}

	server := http.Server{
		Addr:    "0.0.0.0:8080",
		Handler: app,
	}

	slog.Info("HTTP server listening", "address", server.Addr)
	log.Fatal(server.ListenAndServe())
}
