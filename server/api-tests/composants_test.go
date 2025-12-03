package apitests

import (
	models "backend/models"
	tu "backend/test-utils"
	"net/http"
	"testing"
)

func TestPreventCreationWithInvalidMatiere(t *testing.T) {

	// Non existing matiere ID
	withInvalidMat := doc{
		"nom":      "the compo",
		"matiere":  "abcdef12-8c58-4b07-9e51-527faf695daa",
		"type":     "etoffe",
		"quantite": 20,
		"unite":    "g",
	}
	code := 0
	call("POST", "/api/composants", withInvalidMat, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}

	// Invalid format for matiere ID
	withInvalidMat["matiere"] = "salut"

	code = 0
	call("POST", "/api/composants", withInvalidMat, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}
}

func TestUpdateComposantHappyCase(t *testing.T) {

	compoID := initResourceIds["composants"]
	compoA_bef := retrieveRsc[models.Composant](t, "composants", compoID)
	updateRsc(t, "composants", compoID, doc{"nom": "le-composant-initial"})
	compoA_aft := retrieveRsc[models.Composant](t, "composants", compoID)

	tu.ExpectDiff(t, compoA_bef.Nom, compoA_aft.Nom, "Wrong update")
}
