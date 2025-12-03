package api

import (
	"backend/auth"
	"backend/business"
	"backend/db"
	"backend/models"
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"slices"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

var GetMatieres = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	dbDocs, err := findMatching[models.MatiereDB](db.Matieres, user.Orga, bson.M{}, projPublic)

	if err != nil {
		return http.StatusInternalServerError, nil
	}

	return http.StatusOK, dbDocs
})

var GetMatieresIds = MakeHandlerFunc(func(req *http.Request) (int, any) {

	user := auth.GetUser(req)
	IDs, err := listIDs(db.Matieres, user.Orga)
	if err != nil {
		return http.StatusInternalServerError, nil
	}
	return http.StatusOK, IDs
})

func validateMatiere(mat *models.MatiereDB) (int, any) {

	indexedSubMatersDB := map[string]models.MatiereDB{} // For recyclability computation

	// Removing the subMaterials which rate == 0
	mat.Matieres = slices.DeleteFunc(mat.Matieres, func(sub models.SubMater) bool {
		return sub.Rate == 0
	})

	subMaters := mat.Matieres
	subMatFamilies := map[string]bool{}

	if len(subMaters) > 0 {

		subMaterIDs := []string{}
		var totalSubs float64 = 0
		for _, subMater := range subMaters {
			subMaterIDs = append(subMaterIDs, subMater.ID)
			totalSubs += subMater.Rate
		}

		if !equalFloat(totalSubs, 1) {
			slog.Info("❌ Sub-materials rates not adding to 100%")
			return http.StatusBadRequest, "Sub-materials rates not adding to 100%"
		}

		// Existence check
		subMatersDB, err := findMatching[models.MatiereDB](db.Matieres, mat.Orga, bson.M{"id": bson.M{"$in": subMaterIDs}}, bson.M{})
		if err != nil {
			return http.StatusInternalServerError, nil
		}
		if len(subMatersDB) != len(subMaters) {
			slog.Info("❌ Sub-material ID mismatch in DB", "IDs in the request", subMaterIDs, "Number in DB", len(subMatersDB))
			return http.StatusBadRequest, "Sub-material ID mismatch in DB"
		}

		// Check a material can contain only pure sub-materials
		for _, subMaterDB := range subMatersDB {
			if subMaterDB.Matieres != nil && len(subMaterDB.Matieres) != 0 {
				slog.Info("❌ Sub-materials must be pure", "non-pure sub-material", subMaterDB.ID)
				return http.StatusBadRequest, "Sub-materials must be pure"
			}
		}

		for _, subMaterDB := range subMatersDB {
			indexedSubMatersDB[subMaterDB.ID] = subMaterDB
			subMatFamilies[subMaterDB.Famille] = true
		}
	}
	if len(subMatFamilies) == 0 {
		if mat.Famille == "" {
			slog.Info("❌ The pure material familly must be set")
			return http.StatusBadRequest, "Pure material familly must be set"
		}
	} else if len(subMatFamilies) == 1 {
		for fam := range subMatFamilies {
			mat.Famille = fam
		}
	} else {
		mat.Famille = "melange-matieres"
	}

	business.ComputeRecyclabilite(mat, indexedSubMatersDB)
	return 0, nil
}

var PostMatiere = MakeHandlerFunc(func(req *http.Request) (int, any) {
	user := auth.GetUser(req)

	var dbDoc models.Matiere
	err := json.NewDecoder(req.Body).Decode(&dbDoc)
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	// MongoDB does not create a UUID (secu, do not leak internal DB IDs)
	dbDoc.ID = uuid.New().String()
	dbDoc.Orga = user.Orga

	code, respBody := validateMatiere(&dbDoc)
	if code != 0 {
		return code, respBody
	}

	_, err = db.Matieres.InsertOne(context.Background(), dbDoc)

	if err != nil {
		slog.Error("Unable to insert into the DB", "error", err)
		return http.StatusInternalServerError, nil
	}

	slog.Info("Matiere saved into the DB", "ID", dbDoc.ID)
	return http.StatusCreated, dbDoc.ID
})

var GetOneMatiere = MakeHandlerFunc(func(req *http.Request) (int, any) {
	matiereID := req.PathValue("matiereId")
	user := auth.GetUser(req)
	slog.Info("Getting a matiere", "matiereID", matiereID)

	matiere, err := findOne[models.MatiereDB](db.Matieres, matiereID, user.Orga, projPublic)

	if err != nil {
		slog.Info("Matiere not found", "error", err)
		return http.StatusNotFound, "Matiere not found"
	} else {
		return http.StatusOK, matiere
	}
})

var DeleteMatiere = MakeHandlerFunc(func(req *http.Request) (int, any) {
	matiereID := req.PathValue("matiereId")
	user := auth.GetUser(req)
	slog.Info("Deleting a matiere", "matiereID", matiereID)

	// Retrieve matieres containing it, list them & refresh
	depMats, err := findMatching[models.Matiere](db.Matieres, user.Orga,
		bson.M{"matieres": bson.M{"$elemMatch": bson.M{"id": matiereID}}},
		bson.M{"id": 1})

	if err != nil {
		slog.Error("Unable to retrieve the impacted resources", "error", err)
		return http.StatusInternalServerError, depMats
	}

	depMatIDs := models.GetIDs(depMats)
	depProds, depCompos, err := listDependantProduitsAndComposants(user.Orga, append(depMatIDs, matiereID)) // Get the resources impacted by itself too
	if err != nil {
		slog.Error("Unable to retrieve the impacted resources", "error", err)
		return http.StatusInternalServerError, nil
	}

	depCompoIDs := models.GetIDs(depCompos)
	depProdDs := models.GetIDs(depProds)

	conflicts := map[string][]string{} // A map is random-ordered, maybe an ordered list would help deleting in an optimized order

	if len(depMatIDs) > 0 {
		conflicts["matieres"] = depMatIDs
	}
	if len(depCompoIDs) > 0 {
		conflicts["composants"] = depCompoIDs
	}
	if len(depProdDs) > 0 {
		conflicts["produits"] = depProdDs
	}
	if len(conflicts) > 0 {
		slog.Info("Impacted resources found", "conflicts", conflicts)
		return http.StatusConflict, conflicts
	}

	filter := filterId(matiereID, user.Orga)
	result, err := db.Matieres.DeleteOne(context.Background(), filter)
	if err != nil {
		slog.Error("DB error 4", "error", err)
		return http.StatusInternalServerError, nil
	}

	if result.DeletedCount > 0 {
		slog.Info("Deletion done", "nb", result.DeletedCount)
		return http.StatusNoContent, nil
	} else {
		slog.Info("Matiere not found")
		return http.StatusNotFound, "Matiere not found"
	}
})

// Return the IDs of the updated materials
func updateDependantMater(mat *models.MatiereDB) (int, any, []string) {

	impactedIDs := []string{}

	// Retrieve matieres containing it, list them & refresh
	dependantMats, err := findMatching[models.MatiereDB](db.Matieres, mat.Orga,
		bson.M{"matieres": bson.M{"$elemMatch": bson.M{"id": mat.ID}}}, bson.M{})
	if err != nil {
		slog.Error("Unable to retrieve the impacted resources", "error", err)

		// Shall we forget the current ID ? How to handle the nested error ?
		return http.StatusInternalServerError, nil, impactedIDs
	}

	slog.Info("Dependent materials to update", "deps", len(dependantMats))

	matsToUpdate := []*models.MatiereDB{mat}
	for _, dep := range dependantMats {
		matsToUpdate = append(matsToUpdate, &dep)
	}

	for _, dep := range matsToUpdate {
		code, respBody := validateMatiere(dep)
		if code != 0 {
			return code, respBody, impactedIDs
		}

		filter := bson.M{"id": dep.ID}
		update := bson.M{"$set": dep}
		_, err := db.Matieres.UpdateOne(context.Background(), filter, update)

		if err != nil {
			slog.Error("Unable to update into the DB", "error", err)

			// Shall we forget the current ID ?
			return http.StatusInternalServerError, nil, impactedIDs
		}
		impactedIDs = append(impactedIDs, dep.ID)
	}

	return 0, nil, impactedIDs
}

var PutMatiere = MakeHandlerFunc(func(req *http.Request) (int, any) {
	matiereID := req.PathValue("matiereId")
	user := auth.GetUser(req)

	matiereDB, err := findOne[models.MatiereDB](db.Matieres, matiereID, user.Orga, bson.M{})
	if err != nil {
		slog.Info("Matiere not found", "error", err)
		return http.StatusNotFound, "Matiere not found"
	}

	err = json.NewDecoder(req.Body).Decode(&matiereDB) // High-level merge of the data structures
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	// TODO use https://pkg.go.dev/go.mongodb.org/mongo-driver/mongo#WithSession to commit the changes only if complete success else rollback
	code, respBody, matIDs := updateDependantMater(&matiereDB)

	if code != 0 {
		return code, respBody
	}

	slices.Sort(matIDs)
	matIDs = slices.Compact(matIDs)
	slog.Info("Matiere updated into the DB", "impacted", matIDs)

	prods, _, err := listDependantProduitsAndComposants(user.Orga, matIDs)
	if err != nil {
		// TODO abort the whole operation
		return http.StatusInternalServerError, nil
	}

	// prodsJson, _ := json.MarshalIndent(prods, "", "\t")
	// composJson, _ := json.MarshalIndent(compos, "", "\t")
	// slog.Info("🎃🎃", "prodsJson", string(prodsJson), "composJson", string(composJson))

	// prodNames := models.GetIDs(prods)
	// compoNames := models.GetIDs(compos)
	// slog.Info("Cascade matiere update", "prodNames", prodNames, "compoNames", compoNames)

	for _, prod := range prods {
		code, respBody = updateProduit(&prod)
		if code != 0 {
			// TODO abort the whole operation
			return code, respBody
		}
	}

	return http.StatusNoContent, nil
})
