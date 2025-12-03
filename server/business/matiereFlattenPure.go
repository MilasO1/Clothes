package business

import (
	"backend/models"
	"log/slog"
	"slices"
	"strings"
)

type FlatMatiere struct {
	Matiere *models.Matiere
	Rate    float64
}

func followSubs(currMat *models.Matiere, currRate float64, mats []models.Matiere, result *[]FlatMatiere) {

	if len(currMat.Matieres) == 0 {
		// Pure: we store & stop: need to accumulate of previous occurence if any

		// Skip the custom matiere not in ecobalyse list
		if strings.HasPrefix(currMat.IdEcobalyse, "custom-") {
			return
		}

		idx := slices.IndexFunc(*result, func(fm FlatMatiere) bool {
			return fm.Matiere.ID == currMat.ID
		})

		if idx != -1 {
			(*result)[idx].Rate += currRate
		} else {
			*result = append(*result, FlatMatiere{Matiere: currMat, Rate: currRate})
		}
		return
	}

	for _, subMat := range currMat.Matieres {
		nextMat := models.FindByID(subMat.ID, mats)

		if nextMat != nil {
			followSubs(nextMat, currRate*subMat.Rate, mats, result)
		} else {
			slog.Error("❌ Sub-mat not found in the tree", "parent", currMat.ID, "submat", subMat.ID)
		}
	}
}

// Among a list of mixed and pure matieres, reduce it into the flat list of pure matieres and the share of each,
func FlattenToPure(rootMatID string, mats []models.Matiere) []FlatMatiere {
	result := []FlatMatiere{}

	rootMat := models.FindByID(rootMatID, mats)

	if rootMat != nil {
		followSubs(rootMat, 1, mats, &result)
	} else {
		slog.Error("❌ Root mat not found in the tree", "ID", rootMatID)
	}

	return result
}

// func ProduitMass(compos []models.ComposantForImpact) float64 {
// 	var prodMass float64 = 0
// 	for _, compo := range compos {

// 		var compoMass float64 = 0

// 		flatMats := FlattenToPure(compo.Matiere, compo.Expanded)
// 		fmt.Printf("🎃 %+v\n", flatMats)

// 		for _, pureMat := range flatMats {

// 			compoMass += MassKg(compo.Quantite, compo.Unite, pureMat.Matiere.Famille) * pureMat.Rate
// 		}
// 		prodMass += compoMass
// 	}
// 	return prodMass
// }
