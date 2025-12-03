package api

import (
	"backend/auth"
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"slices"

	"github.com/google/uuid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func listCompoForAnalysis(orga string, prod *models.Produit) ([]models.ComposantForAnalysis, error) {

	compoIDs := models.Map(prod.Compositions, models.Composition.GetCompoID)

	pipeline := []bson.M{
		{"$match": filterId(bson.M{"$in": compoIDs}, orga)},
		{"$lookup": bson.M{"from": "matieres", "localField": "matiere", "foreignField": "id", "as": "matiere"}},
		{"$set": bson.M{
			"matiere": bson.M{"$first": "$matiere"},
		}},
	}

	return requestCompoPipeline[models.ComposantForAnalysis](pipeline)
}

func listCompoForImpacts(orga string, prod *models.Produit) ([]models.ComposantForImpact, error) {

	compoIDs := models.Map(prod.Compositions, models.Composition.GetCompoID)

	pipeline := []bson.M{
		{"$match": filterId(bson.M{"$in": compoIDs}, orga)},
		{"$graphLookup": bson.M{"from": "matieres", "startWith": "$matiere", "connectToField": "id", "connectFromField": "matieres.id", "as": "expanded"}},
		{"$project": bson.M{
			"_id":           0,
			"id":            1,
			"expanded":      1,
			"matiere":       1,
			"masseunitaire": 1,
			"unite":         1,
		}},
	}

	return requestCompoPipeline[models.ComposantForImpact](pipeline)
}

func requestCompoPipeline[T any](pipeline []bson.M) ([]T, error) {

	var result []T

	cursor, err := db.Composants.Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	err = cursor.All(context.Background(), &result)
	if err != nil {
		return nil, err
	}

	return result, nil
}

var GetComposants = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	dbDocs, err := findMatching[models.ComposantDB](db.Composants, user.Orga, bson.M{}, projPublic)

	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusOK, dbDocs
})

var GetComposantsIds = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	IDs, err := listIDs(db.Composants, user.Orga)
	if err != nil {
		return http.StatusInternalServerError, nil
	}
	return http.StatusOK, IDs
})

var PostComposant = MakeHandlerFunc(func(req *http.Request) (int, any) {
	user := auth.GetUser(req)

	var dbDoc models.Composant
	err := json.NewDecoder(req.Body).Decode(&dbDoc)
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	dbDoc.ID = uuid.New().String()
	dbDoc.Orga = user.Orga

	code, respBody := validateComposant(&dbDoc)
	if code != 0 {
		return code, respBody
	}

	_, err = db.Composants.InsertOne(context.Background(), dbDoc)

	if err != nil {
		slog.Error("Unable to insert into the DB", "error", err)
		return http.StatusInternalServerError, nil
	}

	slog.Info("Composant saved into the DB", "ID", dbDoc.ID)
	return http.StatusCreated, dbDoc.ID
})

var GetOneComposant = MakeHandlerFunc(func(req *http.Request) (int, any) {
	composantID := req.PathValue("composantId")
	user := auth.GetUser(req)

	var composant models.ComposantDB

	filter := filterId(composantID, user.Orga)
	result := db.Composants.FindOne(context.Background(), filter, options.FindOne().SetProjection(projPublic))
	err := result.Decode(&composant)

	if err != nil {
		slog.Info("Composant not found")
		return http.StatusNotFound, "Composant not found"
	} else {
		return http.StatusOK, composant
	}
})

var DeleteComposant = MakeHandlerFunc(func(req *http.Request) (int, any) {
	composantID := req.PathValue("composantId")
	user := auth.GetUser(req)

	filter := filterId(composantID, user.Orga)
	result, err := db.Composants.DeleteOne(context.Background(), filter)
	if err != nil {
		slog.Error("DB error 4", "error", err)
		return http.StatusInternalServerError, nil
	}

	if result.DeletedCount > 0 {
		return http.StatusNoContent, nil
	} else {
		slog.Info("Composant not found")
		return http.StatusNotFound, "Composant not found"
	}
})

func validateComposant(compo *models.ComposantDB) (int, any) {
	existingMatIDs, err := listIDs(db.Matieres, compo.Orga)
	if err != nil {
		return http.StatusInternalServerError, nil
	}

	if !slices.Contains(existingMatIDs, compo.Matiere) {
		return http.StatusBadRequest, "Matiere ID does not exist"
	}

	return 0, nil
}

func updateComposant(compo *models.ComposantDB) (int, any) {
	code, respBody := validateComposant(compo)
	if code != 0 {
		return code, respBody
	}

	filter := bson.M{"id": compo.ID}
	update := bson.M{"$set": compo}
	_, err := db.Composants.UpdateOne(context.Background(), filter, update)

	if err != nil {
		slog.Error("Unable to update into the DB", "error", err)
		return http.StatusInternalServerError, nil
	}

	return 0, nil
}

var PutComposant = MakeHandlerFunc(func(req *http.Request) (int, any) {
	composantID := req.PathValue("composantId")
	user := auth.GetUser(req)

	composantDB, err := findOne[models.ComposantDB](db.Composants, composantID, user.Orga, bson.M{})
	if err != nil {
		slog.Info("Composant not found", "error", err)
		return http.StatusNotFound, "Composant not found"
	}

	err = json.NewDecoder(req.Body).Decode(&composantDB) // High-level merge of the data structures
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	// TODO use https://pkg.go.dev/go.mongodb.org/mongo-driver/mongo#WithSession to commit the changes only if complete success else rollback
	code, respBody := updateComposant(&composantDB)
	if code != 0 {
		return code, respBody
	}

	prods, err := listDependantProduits(composantDB.Orga, composantDB.ID)
	if err != nil {
		// TODO abort the whole operation
		return http.StatusInternalServerError, nil
	}
	prodNames := models.GetIDs(prods)
	slog.Info("Cascade composant update", "prodNames", prodNames)

	for _, prod := range prods {
		code, respBody = updateProduit(&prod)
		if code != 0 {
			// TODO abort the whole operation
			return code, respBody
		}
	}
	return http.StatusNoContent, nil
})
