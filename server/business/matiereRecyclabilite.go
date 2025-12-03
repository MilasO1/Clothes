package business

import (
	"backend/models"
	"log/slog"
)

type SubmatersDB = map[string]models.MatiereDB // By ID

// Ref: https://www.canva.com/design/DAGUMcbPatE/rnScXUCb-JX4R1ApXLtVnA/edit
// slide 9: Evaluer la recyclabilité d’une matière mélangée
// La consommation d'eau et le scorePEF sont la moyenne pondérée des sous-matieres
func ComputeRecyclabilite(mat *models.MatiereDB, subMatsDB SubmatersDB) {

	if len(mat.Matieres) == 0 {
		return
	}

	familyRate := map[string]float64{}
	var avgRecyc float64 = 0
	var avgComplemMicrofibres float64 = 0
	var avgConsoEau float64 = 0
	var avgCoutEnv float64 = 0
	var avgScorePEF float64 = 0

	for _, subMat := range mat.Matieres {
		subMatDB := subMatsDB[subMat.ID]
		avgRecyc += subMat.Rate * subMatDB.Recyclabilite
		avgComplemMicrofibres += subMat.Rate * subMatDB.ComplemMicrofibres
		avgConsoEau += subMat.Rate * subMatDB.ConsoEau
		avgCoutEnv += subMat.Rate * subMatDB.CoutEnv
		avgScorePEF += subMat.Rate * subMatDB.ScorePEF
		familyRate[subMatDB.Famille] += subMat.Rate
	}

	var factor float64 = 1

	if len(familyRate) == 1 {
		// Keep 1, max score for pure maters
	} else if familyRate["elasthane"] > 0.03 || familyRate["metal"] > 0.03 {
		factor = 0
	} else if familyRate["elasthane"] > 0 || familyRate["metal"] > 0 {
		factor = 0.2
	} else {
		factor = 0.5
	}

	slog.Info("📜 recyclabilite", "factor", factor, "rates", familyRate)
	mat.Recyclabilite = avgRecyc * factor

	mat.ComplemMicrofibres = avgComplemMicrofibres
	mat.ConsoEau = avgConsoEau
	mat.CoutEnv = avgCoutEnv
	mat.ScorePEF = avgScorePEF
}
