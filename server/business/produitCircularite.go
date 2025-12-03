package business

import (
	"backend/models"
	"fmt"
	"log/slog"
)

var unitsDimention = map[string]string{
	"kg":    "mass",
	"g":     "mass",
	"m²":    "surface",
	"cm²":   "surface",
	"m-140": "surface",
	"m-135": "surface",
	"yard":  "surface",
	"piece": "number",
}

// Factor to convert the SI unit for the dimension (kg, m²)
var unitConvertionSI = map[string]float64{
	"kg":    1,
	"g":     0.001,
	"m²":    1,
	"cm²":   0.0001,
	"m-140": 1.4,
	"m-135": 1.35,
	"yard":  0.91 * 1.5,
	"piece": 1,
}

// In kg
func CompositionMass(composi *models.Composition) (float64, error) {
	if unitsDimention[composi.Unite] == "mass" {
		// Shortcut, we have the mass already
		return composi.Nombre * unitConvertionSI[composi.Unite], nil
	} else if unitsDimention[composi.Unite] == unitsDimention[composi.Composant.Unite] {
		// Convert to SI for common ground
		return composi.Composant.MasseUnitaire * composi.Nombre * unitConvertionSI[composi.Unite] / unitConvertionSI[composi.Composant.Unite], nil
	} else {
		return 0, fmt.Errorf("Unités incompatibles: %q, %q", composi.Unite, composi.Composant.Unite)
	}
}

// Ref: https://www.canva.com/design/DAGUMcbPatE/rnScXUCb-JX4R1ApXLtVnA/edit
// slide 6: Identification des matières à recycler
// slide 8: La Méthode d’évaluation de la recyclabilité produit de darwie
// Recomputed on each update & stored in DB
func ComputeCircularite(prod *models.Produit) (models.ProduitCircularity, float64, error) {

	prodCircu := models.ProduitCircularity{}
	var prodMass float64 = 0
	var prodRecyclMass float64 = 0

	if prod == nil {
		return prodCircu, 0, fmt.Errorf("Produit nil")
	}

	for _, composi := range prod.Compositions {

		compoMass, err := CompositionMass(&composi)
		if err != nil {
			return prodCircu, 0, err
		}

		//MassKg(compo.Quantite, compo.Unite, compo.Famille)
		prodMass += compoMass
		prodRecyclMass += compoMass * composi.Composant.Matiere.Recyclabilite

		accum := prodCircu[composi.Composant.Matiere.Famille]
		accum.TotalMass += compoMass
		accum.RecyclMass += compoMass * composi.Composant.Matiere.Recyclabilite
		prodCircu[composi.Composant.Matiere.Famille] = accum
	}

	// Filter only the most significant ones
	for fam := range prodCircu {
		recyc := prodCircu[fam]

		if fam != "metal" && recyc.TotalMass < prodMass*0.3 {
			recyc.RecyclMass = 0
			prodCircu[fam] = recyc
		}
	}

	var prodRecycl float64 = 0
	if prodMass != 0 {
		prodRecycl = prodRecyclMass / prodMass
	}

	slog.Info("📜 circularite", "by famille", prodCircu, "recyclabilite", prodRecycl)
	return prodCircu, prodRecycl, nil
}
