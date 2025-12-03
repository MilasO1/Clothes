package api

import (
	"backend/auth"
	"backend/business"
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"slices"

	"github.com/google/uuid"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Enriches the produit with details composants
func addCompoForAnalysis(orga string, prod *models.Produit) error {
	composAna, err := listCompoForAnalysis(orga, prod)
	if err != nil {
		return err
	}

	// if len(composAna) != len(prod.Compositions) {
	// 	slog.Info("Number of composant mismatch", "Nb in composition", len(prod.Compositions), "Number in DB", len(composAna))
	// 	return http.StatusBadRequest, "Sub-material ID mismatch in DB"
	// }

	for idx, composi := range prod.Compositions {
		compoIdx := slices.IndexFunc(composAna, func(item models.ComposantForAnalysis) bool { return composi.ComposantID == item.ID })
		if compoIdx == -1 {
			return errors.New("Component ID does not exist")
		}
		prod.Compositions[idx].Composant = &composAna[compoIdx]
	}
	return nil
}

var GetProduits = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	dbDocs, err := findMatching[models.ProduitDB](db.Produits, user.Orga, bson.M{}, projPublic)

	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusOK, dbDocs
})

var GetProduitsIds = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	IDs, err := listIDs(db.Produits, user.Orga)
	if err != nil {
		return http.StatusInternalServerError, nil
	}
	return http.StatusOK, IDs
})

func validateEnrichProduit(prod *models.ProduitDB) (int, any) {

	err := addCompoForAnalysis(prod.Orga, prod)
	if err != nil {
		return http.StatusInternalServerError, nil
	}

	prod.Circularite, prod.Recyclabilite, err = business.ComputeCircularite(prod)
	if err != nil {
		slog.Error("Circularity computation error", "error", err)
		return http.StatusInternalServerError, nil
	}
	return 0, nil
}

func listDependantProduits(orga string, compoID string) ([]models.ProduitDB, error) {
	return findMatching[models.ProduitDB](db.Produits, orga, bson.M{"compositions.composantid": bson.M{"$in": bson.A{compoID}}}, bson.M{})
}

func listDependantProduitsAndComposants(orga string, matIDs []string) ([]models.ProduitDB, []models.ComposantDB, error) {
	compos, err := findMatching[models.ComposantDB](db.Composants, orga, bson.M{"matiere": bson.M{"$in": matIDs}}, bson.M{})

	if err != nil {
		return nil, nil, err
	}

	compoIDs := models.GetIDs(compos)
	prods, err := findMatching[models.ProduitDB](db.Produits, orga, bson.M{"compositions.composantid": bson.M{"$in": compoIDs}}, bson.M{}) //Lowercase! Also, $in acts as an intersect for array fields

	return prods, compos, err
}

var PostProduit = MakeHandlerFunc(func(req *http.Request) (int, any) {
	user := auth.GetUser(req)

	var dbDoc models.Produit
	err := json.NewDecoder(req.Body).Decode(&dbDoc)
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	// MongoDB does not create a UUID (secu, do not leak internal DB IDs)
	dbDoc.ID = uuid.New().String()
	dbDoc.Orga = user.Orga

	code, respBody := validateEnrichProduit(&dbDoc)
	if code != 0 {
		return code, respBody
	}

	_, err = db.Produits.InsertOne(context.Background(), dbDoc)

	if err != nil {
		slog.Error("Unable to insert into the DB", "error", err)
		return http.StatusInternalServerError, nil
	}

	slog.Info("Produit saved into the DB", "ID", dbDoc.ID)
	return http.StatusCreated, dbDoc.ID
})

var GetOneProduit = MakeHandlerFunc(func(req *http.Request) (int, any) {
	produitID := req.PathValue("produitId")
	user := auth.GetUser(req)
	slog.Info("Getting a produit", "produitID", produitID)

	var dbDoc models.ProduitDB

	filter := filterId(produitID, user.Orga)
	result := db.Produits.FindOne(context.Background(), filter, options.FindOne().SetProjection(projPublic))
	err := result.Decode(&dbDoc)
	if err != nil {
		slog.Error("Unable to decode the document", "error", err)
		return http.StatusNotFound, nil
	}

	prod := &dbDoc

	err = addCompoForAnalysis(user.Orga, prod)
	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusOK, prod
})

var DeleteProduit = MakeHandlerFunc(func(req *http.Request) (int, any) {
	produitID := req.PathValue("produitId")
	user := auth.GetUser(req)
	slog.Info("Deleting a produit", "produitID", produitID)

	filter := filterId(produitID, user.Orga)
	result, err := db.Produits.DeleteOne(context.Background(), filter)
	if err != nil {
		slog.Error("DB error 4", "error", err)
		return http.StatusInternalServerError, nil
	}

	if result.DeletedCount > 0 {
		return http.StatusNoContent, nil
	} else {
		slog.Info("Produit not found")
		return http.StatusNotFound, "Produit not found"
	}
})

func updateProduit(prod *models.ProduitDB) (int, any) {
	code, respBody := validateEnrichProduit(prod)
	if code != 0 {
		return code, respBody
	}

	filter := bson.M{"id": prod.ID}
	update := bson.M{"$set": prod}
	_, err := db.Produits.UpdateOne(context.Background(), filter, update)

	if err != nil {
		slog.Error("Unable to update into the DB", "error", err)
		return http.StatusInternalServerError, nil
	}

	return 0, nil
}

var PutProduit = MakeHandlerFunc(func(req *http.Request) (int, any) {
	produitID := req.PathValue("produitId")
	user := auth.GetUser(req)

	produitDB, err := findOne[models.ProduitDB](db.Produits, produitID, user.Orga, bson.M{})
	if err != nil {
		slog.Info("Produit not found", "error", err)
		return http.StatusNotFound, "Produit not found"
	}

	err = json.NewDecoder(req.Body).Decode(&produitDB) // High-level merge of the data structures
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	code, respBody := updateProduit(&produitDB)
	if code != 0 {
		return code, respBody
	}

	return http.StatusNoContent, nil
})
