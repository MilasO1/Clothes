package apitests

import (
	models "backend/models"
	tu "backend/test-utils"
	"net/http"
	"slices"
	"testing"
)

func TestPreventCreationInvalidSubMater(t *testing.T) {

	// Non existing sub-mater ID
	invalidSub := doc{
		"nom":      "Georgette de soie",
		"famille":  "laine",
		"matieres": []subMater{{ID: "f6dfda38-8c58-4b07-9e51-527faf695daa", Rate: 0.88}},
	}
	code := 0
	call("POST", "/api/matieres", invalidSub, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}

	// Invalid format for matiere ID
	invalidSub["matieres"] = []subMater{{ID: "salut", Rate: 0.88}}
	call("POST", "/api/matieres", invalidSub, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}

	// Too much sub-mater rate sum
	updatedSubMaters := []subMater{
		{ID: initResourceIds["matieres"], Rate: 0.88},
		{ID: initResourceIds["matieres"], Rate: 0.64},
	}

	invalidSub["matieres"] = updatedSubMaters
	code = 0
	call("POST", "/api/matieres", invalidSub, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}

	missingFamPureMater := doc{
		"nom": "fil de laine",
	}
	code = 0
	call("POST", "/api/matieres", missingFamPureMater, &code, nil)
	if code != http.StatusBadRequest {
		t.Error("We should get rejected, got", code)
	}
}

func TestCreateWithSubMaterFromOtherOrga(t *testing.T) {
	login("test-reader-writer-2")
	idMat1 := createRsc(t, "matieres", doc{
		"nom":           "laine synthetique",
		"famille":       "polyester",
		"recyclabilite": 1,
	})

	login("test-reader-writer-1")
	mat2 := doc{
		"nom":     "laine super",
		"famille": "polyester",
		"matieres": []subMater{
			{ID: idMat1, Rate: 1},
		},
	}
	code := 0
	idMat2 := ""
	call("POST", "/api/matieres", mat2, &code, &idMat2)
	if code != http.StatusBadRequest {
		t.Fatal("Second matiere creation should fail because it refers another orga's matiere, got", code)
	}
}

func TestCreateWithManySubMaters(t *testing.T) {
	idMat1 := createRsc(t, "matieres", doc{
		"nom":           "fibre elastique",
		"famille":       "elasthane",
		"recyclabilite": 0.9,
		"scorePEF":      100,
	})

	idMat2 := createRsc(t, "matieres", doc{
		"nom":           "laine synthetique",
		"famille":       "polyester",
		"recyclabilite": 1,
		"scorePEF":      200,
	})

	idMat3 := createRsc(t, "matieres", doc{
		"nom": "laine elastique",
		"matieres": []subMater{
			{ID: idMat1, Rate: 0.01},
			{ID: idMat2, Rate: 0.99},
		},
	})

	mat3Retrieved := retrieveRsc[models.MatiereDB](t, "matieres", idMat3)

	tu.ExpectEqualF(t, mat3Retrieved.Recyclabilite, 0.1998, "Wrong recyclabilite")
	tu.ExpectEqualF(t, mat3Retrieved.ScorePEF, 199, "Wrong scorePEF")
	tu.ExpectEqual(t, mat3Retrieved.Famille, "melange-matieres", "Wrong famille")
}

func TestCreateWithSubMaterRateZero(t *testing.T) {
	idMat1 := createRsc(t, "matieres", doc{
		"nom":      "fibre elastique",
		"famille":  "elasthane",
		"scorePEF": 100,
	})

	idMat2 := createRsc(t, "matieres", doc{
		"nom":      "laine synthetique",
		"famille":  "polyester",
		"scorePEF": 200,
	})

	idMat3 := createRsc(t, "matieres", doc{
		"nom": "juste laine",
		"matieres": []subMater{
			{ID: idMat1, Rate: 0},
			{ID: idMat2, Rate: 1},
		},
	})

	mat3Retrieved := retrieveRsc[models.MatiereDB](t, "matieres", idMat3)

	tu.ExpectEqual(t, len(mat3Retrieved.Matieres), 1, "Wrong removal of rate 0")
	tu.ExpectEqualF(t, mat3Retrieved.ScorePEF, 200, "Wrong scorePEF")
	tu.ExpectEqual(t, mat3Retrieved.Famille, "polyester", "Wrong famille")
}

func TestMaterUpdateWithDependant(t *testing.T) {
	idMatA := createRsc(t, "matieres", doc{
		"nom":           "Aaa",
		"famille":       "polyester",
		"recyclabilite": 0.2,
		"scorePEF":      100,
	})
	idMatB := createRsc(t, "matieres", doc{
		"nom":           "Bbb",
		"famille":       "polyester",
		"recyclabilite": 0.5,
		"scorePEF":      200,
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
		"nom":           "Ddd",
		"famille":       "polyester",
		"recyclabilite": 0.7,
		"scorePEF":      300,
	})
	idMatE := createRsc(t, "matieres", doc{
		"nom":     "Eee",
		"famille": "polyester",
		"matieres": []subMater{
			{ID: idMatB, Rate: 0.4},
			{ID: idMatD, Rate: 0.6},
		},
	})

	idCompoD := createRsc(t, "composants", doc{
		"nom":           "Ddd",
		"matiere":       idMatD,
		"type":          "etoffe",
		"masseUnitaire": 1,
		"unite":         "m²",
	})
	idCompoE := createRsc(t, "composants", doc{
		"nom":           "Eee",
		"matiere":       idMatE,
		"type":          "etoffe",
		"masseUnitaire": 1,
		"unite":         "m²",
	})

	idProdD := createRsc(t, "produits", doc{
		"nom": "Ddd",
		"compositions": []doc{{
			"composantId": idCompoD,
			"nombre":      31,
			"unite":       "cm²",
		}},
		"type": "short",
	})

	idProdE := createRsc(t, "produits", doc{
		"nom": "Eee",
		"compositions": []doc{{
			"composantId": idCompoD,
			"nombre":      31,
			"unite":       "cm²",
		},
			{
				"composantId": idCompoE,
				"nombre":      64,
				"unite":       "cm²",
			}},
		"type": "tshirt",
	})

	matE_bef := retrieveRsc[models.MatiereDB](t, "matieres", idMatE)
	prodD_bef := retrieveRsc[models.ProduitDB](t, "produits", idProdD)
	prodE_bef := retrieveRsc[models.ProduitDB](t, "produits", idProdE)

	updateRsc(t, "matieres", idMatB, doc{
		"recyclabilite": 0.9,
		"scorePEF":      1000,
	})

	matE_aft := retrieveRsc[models.MatiereDB](t, "matieres", idMatE)
	tu.ExpectEqualF(t, matE_aft.ScorePEF, 580, "Wrong scorePEF")
	tu.ExpectDiffF(t, matE_aft.Recyclabilite, matE_bef.Recyclabilite, "Wrong recyclabilite")
	tu.ExpectEqualF(t, matE_aft.Recyclabilite, 0.78, "Wrong recyclabilite")

	prodD_aft := retrieveRsc[models.ProduitDB](t, "produits", idProdD)
	prodE_aft := retrieveRsc[models.ProduitDB](t, "produits", idProdE)
	tu.ExpectEqualF(t, prodD_aft.Circularite["polyester"].RecyclMass, prodD_bef.Circularite["polyester"].RecyclMass, "Wrong circu")
	tu.ExpectDiffF(t, prodE_aft.Circularite["polyester"].RecyclMass, prodE_bef.Circularite["polyester"].RecyclMass, "Wrong circu")

	code := 0
	conflicts := map[string][]string{}
	call("DELETE", "/api/matieres/"+idMatB, nil, &code, &conflicts)
	if code != http.StatusConflict {
		t.Fatal("Resource deletion should fail, got", code)
	}

	matConfl, hasMatConflicts := conflicts["matieres"]
	if !hasMatConflicts || !slices.Equal(matConfl, []string{idMatC, idMatE}) {
		t.Fatal("Matieres conflicts mismatch, got", matConfl)
	}
	compoConfl, hasCompoConflicts := conflicts["composants"]
	if !hasCompoConflicts || !slices.Equal(compoConfl, []string{idCompoE}) {
		t.Fatal("Composants conflicts mismatch, got", compoConfl)
	}
	prodConfl, hasProdConflicts := conflicts["produits"]
	if !hasProdConflicts || !slices.Equal(prodConfl, []string{idProdE}) {
		t.Fatal("Produits conflicts mismatch, got", prodConfl)
	}
}

func TestMaterUpdateTooDeep(t *testing.T) {
	idMatA := createRsc(t, "matieres", doc{
		"nom":     "Aaa",
		"famille": "laine",
	})
	createRsc(t, "matieres", doc{
		"nom": "Bbb",
		"matieres": []subMater{
			{ID: idMatA, Rate: 1},
		},
	})

	// We create a deep nesting, should be blocked by the validation:
	// Matiere nesting depth is max 1, we can have only pure sub-mater
	idMatC := createRsc(t, "matieres", doc{
		"nom":     "Ccc",
		"famille": "laine",
	})

	code := 0
	call("PUT", "/api/matieres/"+idMatA, doc{
		"matieres": []subMater{
			{ID: idMatC, Rate: 1},
		},
	}, &code, nil)
	if code != http.StatusBadRequest {
		t.Fatal("Resource update should not pass, got", code)
	}
}
