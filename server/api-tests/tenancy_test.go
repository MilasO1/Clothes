package apitests

import (
	"net/http"
	"slices"
	"testing"
)

func TestCreateDeleteMatiereOtherOrga(t *testing.T) {

	// Preparation: create 1 matiere with orga1
	login("test-reader-writer-1")
	code := 0
	var matiereIdOrga1 string
	_, err := call("POST", "/api/matieres", &matiereCreation1, &code, &matiereIdOrga1)
	if err != nil || code != http.StatusCreated {
		t.Fatal("Bad matiere creation")
	}
	code = 0
	var composantIdOrga1 string
	compoProto := doc{
		"nom":           "test composant",
		"matiere":       matiereIdOrga1,
		"type":          "accessoire",
		"masseUnitaire": 0.006,
		"unite":         "piece",
	}
	_, err = call("POST", "/api/composants", &compoProto, &code, &composantIdOrga1)
	if err != nil || code != http.StatusCreated {
		t.Fatal("Bad  composant creation")
	}
	code = 0
	var produitIdOrga1 string
	prodDoc := doc{
		"nom":  "test produit",
		"type": "slip",
		"compositions": []doc{
			{
				"composantId": composantIdOrga1,
				"nombre":      3,
				"unite":       "piece",
			},
		},
	}
	_, err = call("POST", "/api/produits", &prodDoc, &code, &produitIdOrga1)
	if err != nil || code != http.StatusCreated {
		t.Fatal("Bad produit creation")
	}

	// Verify the non listing by orga2
	login("test-reader-writer-2")
	retrievedMatiereIDs := []string{}
	call("GET", "/api/matieres/ids", nil, nil, &retrievedMatiereIDs)
	if slices.Contains(retrievedMatiereIDs, matiereIdOrga1) {
		t.Error("Orga2 should not retrieve a matiere from orga1")
	}
	retrievedComposantIDs := []string{}
	call("GET", "/api/matieres/ids", nil, nil, &retrievedComposantIDs)
	if slices.Contains(retrievedComposantIDs, composantIdOrga1) {
		t.Error("Orga2 should not retrieve a composant from orga1")
	}
	retrievedProduitIDs := []string{}
	call("GET", "/api/matieres/ids", nil, nil, &retrievedProduitIDs)
	if slices.Contains(retrievedProduitIDs, produitIdOrga1) {
		t.Error("Orga2 should not retrieve a produit from orga1")
	}

	// Verify the non retrieval
	code = 0
	var matiere1 doc
	call("GET", "/api/matieres/"+matiereIdOrga1, nil, &code, &matiere1)
	if code != http.StatusNotFound || matiere1 != nil {
		t.Error("Orga2 should not retrieve a matiere from orga1")
	}
	code = 0
	var composant1 doc
	call("GET", "/api/composants/"+composantIdOrga1, nil, &code, &composant1)
	if code != http.StatusNotFound || composant1 != nil {
		t.Error("Orga2 should not retrieve a composant from orga1")
	}
	code = 0
	var produit1 doc
	call("GET", "/api/produits/"+produitIdOrga1, nil, &code, &produit1)
	if code != http.StatusNotFound || produit1 != nil {
		t.Error("Orga2 should not retrieve a produit from orga1")
	}

	// Verify the non deletion
	code = 0
	call("DELETE", "/api/matieres/"+matiereIdOrga1, nil, &code, nil)
	if code != http.StatusNotFound {
		t.Error("Orga2 should not get a delete success on a matiere from orga1")
	}
	code = 0
	call("DELETE", "/api/composants/"+composantIdOrga1, nil, &code, nil)
	if code != http.StatusNotFound {
		t.Error("Orga2 should not get a delete success on a composant from orga1")
	}
	code = 0
	call("DELETE", "/api/produits/"+produitIdOrga1, nil, &code, nil)
	if code != http.StatusNotFound {
		t.Error("Orga2 should not get a delete success on a produit from orga1")
	}

	login("test-reader-writer-1")
	call("GET", "/api/matieres/"+matiereIdOrga1, nil, &code, &matiere1)
	if code != http.StatusOK || matiere1 == nil {
		t.Error("The matiere from orga1 should be intact")
	}
	call("GET", "/api/composants/"+composantIdOrga1, nil, &code, &composant1)
	if code != http.StatusOK || composant1 == nil {
		t.Error("The composant from orga1 should be intact")
	}
	call("GET", "/api/produits/"+produitIdOrga1, nil, &code, &produit1)
	if code != http.StatusOK || produit1 == nil {
		t.Error("The produit from orga1 should be intact", code, produit1)
	}
}
