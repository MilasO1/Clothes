package apitests

import (
	"net/http"
	"testing"

	models "backend/models"
	tu "backend/test-utils"
)

func TestEcobalyseImpactHappyCase(t *testing.T) {

	idMatA := createRsc(t, "matieres", doc{
		"nom":         "Aaa",
		"famille":     "plastique",
		"idEcobalyse": "ei-pa",
	})
	idMatB := createRsc(t, "matieres", doc{
		"nom":         "Bbb",
		"famille":     "polyester",
		"idEcobalyse": "ei-coton",
	})
	idMatC := createRsc(t, "matieres", doc{
		"nom":     "Ccc",
		"famille": "polyester",
		"matieres": []subMater{
			{ID: idMatA, Rate: 0.4},
			{ID: idMatB, Rate: 0.6},
		},
	})
	idMatD := createRsc(t, "matieres", doc{
		"nom":         "Ddd",
		"famille":     "polyester",
		"idEcobalyse": "ei-lin",
	})
	idMatE := createRsc(t, "matieres", doc{
		"nom":     "Eee",
		"famille": "polyester",
		"matieres": []subMater{
			{ID: idMatB, Rate: 0.4},
			{ID: idMatD, Rate: 0.6},
		},
	})
	idCompoA := createRsc(t, "composants", doc{
		"nom":           "Aaa",
		"matiere":       idMatC,
		"type":          "etoffe",
		"masseUnitaire": 0.4,
		"unite":         "m²",
	})
	idCompoB := createRsc(t, "composants", doc{
		"nom":           "Bbb",
		"matiere":       idMatE,
		"type":          "etoffe",
		"masseUnitaire": 1.6,
		"unite":         "m²",
	})
	idProdA := createRsc(t, "produits", doc{
		"nom": "Aaa",
		"compositions": []doc{{
			"composantId": idCompoA,
			"nombre":      1,
			"unite":       "m²",
		},
			{
				"composantId": idCompoB,
				"nombre":      1,
				"unite":       "m²",
			}},
		"type": "slip",
	})

	callBody := doc{
		"matieres": []models.MatiereCountry{
			{
				ID:      idMatA,
				Country: "FR",
			},
			{
				ID:      idMatB,
				Country: "CN",
			},
			{
				ID:      idMatD,
				Country: "VN",
			},
		},
		"procedes": []models.ProcodeCountry{
			{
				Type:    "confection",
				Country: "GLO",
			},
			{
				Type:    "teinture",
				Country: "---",
			},
		},
	}

	//"http://localhost:8081/mock/ecobalyse/api/textile/simulator "
	mockID := createMockResponse(t, doc{
		"endpoint": "POST /ecobalyse/api/textile/simulator",
		"code":     http.StatusOK,
		"headers":  http.Header{"Content-Type": {"application/json"}},
		"body":     doc{"impacts": doc{"ecs": 1234, "pef": 7894}},
		//"mode": "hang",
	})

	code := 0
	var resp map[string]float64
	_, err := call("POST", "/api/produits/"+idProdA+"/impact", callBody, &code, &resp)
	if err != nil {
		t.Fatal("Request error", err)
	}

	tu.ExpectEqual(t, code, http.StatusOK, "The response code was incorrect")

	mockResp := retrieveMockResponse(t, mockID)
	tu.ExpectEqual(t, mockResp.Status.NbCalls, 1, "The mock was not called the right number of times")

	tu.ExpectEqualF(t, resp["ecs"], 1234, "The score is not right")

}
