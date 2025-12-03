package api

import (
	"backend/auth"
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/google/uuid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var GetProcedes = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	dbDocs, err := findMatching[models.Procede](db.Procedes, user.Orga, bson.M{}, projPublic)

	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusOK, dbDocs
})

var GetProcedesIds = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	IDs, err := listIDs(db.Procedes, user.Orga)
	if err != nil {
		return http.StatusInternalServerError, nil
	}
	return http.StatusOK, IDs
})

func validateProcede(proc *models.Procede) (int, any) {
	return 0, nil
}

var PostProcede = MakeHandlerFunc(func(req *http.Request) (int, any) {
	user := auth.GetUser(req)

	var dbDoc models.Procede
	err := json.NewDecoder(req.Body).Decode(&dbDoc)
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	// MongoDB does not create a UUID (secu, do not leak internal DB IDs)
	dbDoc.ID = uuid.New().String()
	dbDoc.Orga = user.Orga

	code, respBody := validateProcede(&dbDoc)
	if code != 0 {
		return code, respBody
	}

	_, err = db.Procedes.InsertOne(context.Background(), dbDoc)

	if err != nil {
		slog.Error("Unable to insert into the DB", "error", err)
		return http.StatusInternalServerError, nil
	}

	slog.Info("Procede saved into the DB", "ID", dbDoc.ID)
	return http.StatusCreated, dbDoc.ID
})

var GetOneProcede = MakeHandlerFunc(func(req *http.Request) (int, any) {
	procedeID := req.PathValue("procedeId")
	user := auth.GetUser(req)
	slog.Info("Getting a procede", "procedeID", procedeID)

	var dbDoc models.Procede

	filter := filterId(procedeID, user.Orga)
	result := db.Procedes.FindOne(context.Background(), filter, options.FindOne().SetProjection(projPublic))
	err := result.Decode(&dbDoc)
	if err != nil {
		slog.Error("Unable to decode the document", "error", err)
		return http.StatusNotFound, nil
	}

	return http.StatusOK, dbDoc
})

var DeleteProcede = MakeHandlerFunc(func(req *http.Request) (int, any) {
	procedeID := req.PathValue("procedeId")
	user := auth.GetUser(req)
	slog.Info("Deleting a procede", "procedeID", procedeID)

	filter := filterId(procedeID, user.Orga)
	result, err := db.Procedes.DeleteOne(context.Background(), filter)
	if err != nil {
		slog.Error("DB error 4", "error", err)
		return http.StatusInternalServerError, nil
	}

	if result.DeletedCount > 0 {
		return http.StatusNoContent, nil
	} else {
		slog.Info("Procede not found")
		return http.StatusNotFound, "Procede not found"
	}
})

func updateProcede(proc *models.Procede) (int, any) {
	code, respBody := validateProcede(proc)
	if code != 0 {
		return code, respBody
	}

	filter := bson.M{"id": proc.ID}
	update := bson.M{"$set": proc}
	_, err := db.Procedes.UpdateOne(context.Background(), filter, update)

	if err != nil {
		slog.Error("Unable to update into the DB", "error", err)
		return http.StatusInternalServerError, nil
	}

	return 0, nil
}

var PutProcede = MakeHandlerFunc(func(req *http.Request) (int, any) {
	procedeID := req.PathValue("procedeId")
	user := auth.GetUser(req)

	procedeDB, err := findOne[models.Procede](db.Procedes, procedeID, user.Orga, bson.M{})
	if err != nil {
		slog.Info("Procede not found", "error", err)
		return http.StatusNotFound, "Procede not found"
	}

	err = json.NewDecoder(req.Body).Decode(&procedeDB) // High-level merge of the data structures
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	code, respBody := updateProcede(&procedeDB)
	if code != 0 {
		return code, respBody
	}

	return http.StatusNoContent, nil
})
