package apitests

import (
	"log"
	"net/http"
	"slices"
	"testing"
)

type subMater struct {
	ID   string  `json:"id"`
	Rate float64 `json:"rate"`
}

func getResource(rscType string, t *testing.T) {

	code := 0
	result := []string{}
	_, err := call("GET", "/api/"+rscType+"/ids", nil, &code, &result)
	if err != nil {
		t.Fatal("Request error", err)
	}

	log.Println("GET /api/"+rscType+"/ids ->", code, result)

	if code != http.StatusOK {
		t.Error("We should get code 200, got", code)
	}
	if len(result) != 1 {
		t.Fatal("We should get one item, got", len(result))
	}
	if result[0] != initResourceIds[rscType] {
		t.Error("Listing the IDs, got", result[0])
	}
}

func createDeleteResource(t *testing.T, rscType string, creationData doc) {
	t.Helper()

	code := 0

	recordedIDs := []string{}
	call("GET", "/api/"+rscType+"/ids", nil, &code, &recordedIDs)
	nbBefore := len(recordedIDs)

	newID := ""
	_, err := call("POST", "/api/"+rscType, creationData, &code, &newID)
	if err != nil {
		t.Fatal("Request error", err)
	}

	if code != http.StatusCreated {
		t.Fatal("We should get", rscType, "creation code 200, got", code)
	}

	call("GET", "/api/"+rscType+"/ids", nil, nil, &recordedIDs)
	nbAfterCreate := len(recordedIDs)

	if nbAfterCreate != nbBefore+1 {
		t.Error("We should observe more IDs in DB, got", nbAfterCreate, "expected", nbBefore+1)
	}

	if !slices.Contains(recordedIDs, newID) {
		t.Error("We expected to get the new ID", newID, "in", recordedIDs)
	}

	// Verify the deletion
	call("DELETE", "/api/"+rscType+"/"+newID, nil, &code, nil)

	if code != http.StatusNoContent {
		t.Error("We should get deletion code ", http.StatusNoContent, ", got", code)
	}

	call("GET", "/api/"+rscType+"/ids", nil, nil, &recordedIDs)
	nbAfterDelete := len(recordedIDs)

	if nbAfterDelete != nbBefore {
		t.Error("We should observe as many IDs in DB, got", nbAfterDelete, "expected", nbBefore)
	}

	if slices.Contains(recordedIDs, newID) {
		t.Error("We expected to not get the deleted ID", newID, "in", recordedIDs)
	}
}

func TestGetResource(t *testing.T) {
	for _, rscType := range resourceTypes {
		getResource(rscType, t)
	}
}
func TestCreateDeleteResource(t *testing.T) {

	creationData := []doc{
		{
			"nom":     "pima peruvien",
			"famille": "coton",
			"matieres": []subMater{
				{ID: initResourceIds["matieres"], Rate: 1},
			},
		},
		{
			"nom":           "the composant",
			"matiere":       initResourceIds["matieres"],
			"type":          "etoffe",
			"masseUnitaire": 0.2,
			"unite":         "m²",
		},
		{
			"type": "teinture",
		},
		{
			"nom":  "the produit",
			"type": "pull",
			"compositions": []doc{{
				"composantId": initResourceIds["composants"],
				"nombre":      0.31,
				"unite":       "yard",
			}},
		},
	}
	for idx, rscType := range resourceTypes {
		createDeleteResource(t, rscType, creationData[idx])
	}
}
