package apitests

import (
	models "backend/models"
	tu "backend/test-utils"
	"encoding/json"
	"net/http"
	"testing"
)

func TestPreventCreationWithInvalidComposants(t *testing.T) {

	// At least one non-existing composant ID
	withInvalidCompo := doc{
		"nom":        "the prod",
		"composants": []string{initResourceIds["composants"], "abcdef12-8c58-4b07-9e51-527faf695daa"},
	}
	code := 0
	call("POST", "/api/produits", withInvalidCompo, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}

	// Invalid format for composant ID
	withInvalidCompo["composants"] = []string{"salut"}

	code = 0
	call("POST", "/api/produits", withInvalidCompo, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}

	// Empty composant lists
	withInvalidCompo["composants"] = []string{}

	code = 0
	call("POST", "/api/produits", withInvalidCompo, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}

	// No composant list
	delete(withInvalidCompo, "composants")

	code = 0
	call("POST", "/api/produits", withInvalidCompo, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}
}

func TestCirculariteHappyCase(t *testing.T) {
	idMatA := createRsc(t, "matieres", doc{
		"nom":           "Aaa",
		"famille":       "polyester",
		"recyclabilite": 0.2,
	})
	idMatB := createRsc(t, "matieres", doc{
		"nom":           "Bbb",
		"famille":       "polyester",
		"recyclabilite": 0.3,
	})
	idCompoA := createRsc(t, "composants", doc{
		"nom":           "Aaa",
		"matiere":       idMatA,
		"type":          "etoffe",
		"masseUnitaire": 30,
		"unite":         "m²",
	})
	idCompoB := createRsc(t, "composants", doc{
		"nom":           "Bbb",
		"matiere":       idMatB,
		"type":          "etoffe",
		"masseUnitaire": 20,
		"unite":         "m²",
	})
	idProdA := createRsc(t, "produits", doc{
		"nom": "Aaa",
		"compositions": []doc{{
			"composantId": idCompoA,
			"nombre":      30,
			"unite":       "cm²",
		},
			{
				"composantId": idCompoB,
				"nombre":      50,
				"unite":       "cm²",
			}},
		"type": "pantacourt",
	})

	prodA := retrieveRsc[models.ProduitDB](t, "produits", idProdA)

	prodJson, _ := json.MarshalIndent(prodA, "", "\t")
	tu.ExpectEqualF(t, prodA.Circularite["polyester"].RecyclMass, 0.048, "Wrong recyclable mass computed "+string(prodJson))
}

func TestUpdateProduitHappyCase(t *testing.T) {

	prodA_bef := retrieveRsc[models.ProduitDB](t, "produits", initResourceIds["produits"])
	updateRsc(t, "produits", initResourceIds["produits"], doc{"nom": "le-produit-initial"})
	prodA_aft := retrieveRsc[models.ProduitDB](t, "produits", initResourceIds["produits"])

	tu.ExpectDiff(t, prodA_bef.Nom, prodA_aft.Nom, "Wrong update")
}
