package apitests

import (
	"log"
	"net/http"
)

var matiereCreation1 = doc{"nom": "merinos", "famille": "laine"}
var procedeCreation1 = doc{"type": "teinture"}

var initResourceIds = map[string]string{}
var resourceTypes = []string{"matieres", "composants", "procedes", "produits"}

func clearAllByIds(rscType string, ids []string) {
	for _, id := range ids {
		code := 0
		conflicts := map[string][]string{}
		call("DELETE", "/api/"+rscType+"/"+id, nil, &code, &conflicts)
		if code == http.StatusConflict {
			//log.Println("Deletion conflicts, iterating", conflicts)
			for conflType, conflIDs := range conflicts {
				clearAllByIds(conflType, conflIDs)
			}
			clearAllByIds(rscType, []string{id}) // Now redo, once conflicts are "resolved"
		} else if code == http.StatusNoContent {
			//log.Println("Deleted", id)
		}
	}
}

func clearAllMakeOne(rscType string, data doc) {
	code := 0
	ids := []string{}
	_, err := call("GET", "/api/"+rscType+"/ids", nil, &code, &ids)
	if err != nil || code != http.StatusOK {
		log.Fatalln("Bad listing of", rscType, "during init", err, code)
	}
	clearAllByIds(rscType, ids)

	initResourceId := ""
	_, err = call("POST", "/api/"+rscType, &data, &code, &initResourceId)
	if err != nil || code != http.StatusCreated {
		log.Fatalln("Bad creation of", rscType, "during init", err, code)
	}

	initResourceIds[rscType] = initResourceId
}

func init() {
	clearAllMockResponses()
	login("test-reader-writer-1")

	// Preparation
	clearAllMakeOne("matieres", matiereCreation1)
	clearAllMakeOne("procedes", procedeCreation1)

	var composantCreation1 = doc{
		"nom":           "test composant",
		"matiere":       initResourceIds["matieres"],
		"procedes":      []string{initResourceIds["procedes"]},
		"type":          "etoffe",
		"masseUnitaire": 0.01,
		"unite":         "cm²",
	}
	clearAllMakeOne("composants", composantCreation1)

	prodProto := doc{
		"nom":  "test produit",
		"type": "pantalon",
		"compositions": []doc{{
			"composantId": initResourceIds["composants"],
			"nombre":      1,
			"unite":       "cm²",
		}},
	}
	clearAllMakeOne("produits", prodProto)
}
