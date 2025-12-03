package business

import (
	"testing"

	"backend/models"
	tu "backend/test-utils"
)

// func TestMassConversion(t *testing.T) {

// 	compo := models.ComposantForCirculariteDB{
// 		Famille:  "coton",
// 		Quantite: 1.234,
// 		Unite:    "kg",
// 	}
// 	tu.ExpectEqualF(t, MassKg(compo.Quantite, compo.Unite, compo.Famille), 1.234, "The mass should match")

// 	compo.Quantite = 345.6
// 	compo.Unite = "g"
// 	tu.ExpectEqualF(t, MassKg(compo.Quantite, compo.Unite, compo.Famille), 0.3456, "The mass should match")

// 	compo.Unite = "m²"
// 	tu.ExpectEqualF(t, MassKg(compo.Quantite, compo.Unite, compo.Famille), 48.384, "The mass should match")

// 	compo.Famille = "soie"
// 	tu.ExpectEqualF(t, MassKg(compo.Quantite, compo.Unite, compo.Famille), 20.736, "The mass should match")
// }

func TestNoComposants(t *testing.T) {

	_, _, err := ComputeCircularite(nil)
	tu.ExpectDiff(t, err, nil, "The error should be set")

	prod := models.Produit{}
	prodCircu, prodRecycl, err := ComputeCircularite(&prod)
	tu.ExpectEqual(t, err, nil, "The error should be nil")
	tu.ExpectEqual(t, len(prodCircu), 0, "The circularity should be empty")
	tu.ExpectEqualF(t, prodRecycl, 0, "The recyclability should be 0")
}

func TestGeneralCircularite(t *testing.T) {

	compoTissuCoton := models.ComposantForAnalysis{
		Matiere: models.Matiere{
			Famille:       "coton",
			Recyclabilite: 0.4,
		},
		Composant: models.Composant{
			MasseUnitaire: 0.4,
			Type:          "etoffe",
			Unite:         "kg",
		},
	}

	// Base etoffe coton
	prod := models.Produit{
		Compositions: []models.Composition{
			{
				Nombre:    200,
				Unite:     "g",
				Composant: &compoTissuCoton,
			},
		},
	}

	prodCircu, prodRecycl, err := ComputeCircularite(&prod)
	tu.ExpectEqual(t, err, nil, "The error should be nil")
	tu.ExpectEqual(t, len(prodCircu), 1, "Unexpected nb of entries")
	tu.ExpectEqualF(t, prodCircu["coton"].TotalMass, 0.2, "The total mass should match")
	tu.ExpectEqualF(t, prodCircu["coton"].RecyclMass, 0.08, "The recyclable mass should match")
	tu.ExpectEqualF(t, prodRecycl, 0.4, "The recyclability should match")

	// Adding metal accessories
	compoAccesoireMetal := models.ComposantForAnalysis{
		Matiere: models.Matiere{
			Famille:       "metal",
			Recyclabilite: 0.9,
		},
		Composant: models.Composant{
			MasseUnitaire: 0.006,
			Type:          "accessoire",
			Unite:         "piece",
		},
	}
	prod.Compositions = append(prod.Compositions, models.Composition{
		Nombre:    4,
		Unite:     "piece",
		Composant: &compoAccesoireMetal,
	})

	prodCircu, prodRecycl, err = ComputeCircularite(&prod)
	tu.ExpectEqual(t, err, nil, "The error should be nil")
	tu.ExpectEqual(t, len(prodCircu), 2, "Unexpected nb of entries")
	tu.ExpectEqualF(t, prodCircu["metal"].TotalMass, 0.024, "The total mass should match")
	tu.ExpectEqualF(t, prodCircu["metal"].RecyclMass, 0.0216, "The recyclable mass should match")
	tu.ExpectEqualF(t, prodRecycl, 0.4535714, "The recyclability should match")

	// A little silk, non-recycled because too little
	compoEtoffeSoie := models.ComposantForAnalysis{
		Matiere: models.Matiere{
			Famille:       "soie",
			Recyclabilite: 0.8,
		},
		Composant: models.Composant{
			MasseUnitaire: 0.06,
			Type:          "etoffe",
			Unite:         "m²",
		},
	}
	prod.Compositions = append(prod.Compositions, models.Composition{
		Nombre:    0.01,
		Unite:     "m²",
		Composant: &compoEtoffeSoie,
	})

	prodCircu, prodRecycl, err = ComputeCircularite(&prod)
	tu.ExpectEqual(t, err, nil, "The error should be nil")
	tu.ExpectEqual(t, len(prodCircu), 3, "Unexpected nb of entries")
	tu.ExpectEqualF(t, prodCircu["soie"].TotalMass, 0.0006, "The total mass should match")
	tu.ExpectEqualF(t, prodCircu["soie"].RecyclMass, 0, "The recyclable mass should match")
	tu.ExpectEqualF(t, prodRecycl, 0.4544969, "The recyclability should match")
}
