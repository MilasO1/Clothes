package business

import (
	"testing"

	"backend/models"
	tu "backend/test-utils"
)

func TestNoSubmater(t *testing.T) {

	var initialRecycl float64 = 0.44
	mat := models.MatiereDB{
		Recyclabilite: initialRecycl,
	}
	indexedSubMats := SubmatersDB{}

	ComputeRecyclabilite(&mat, indexedSubMats)

	tu.ExpectEqualF(t, mat.Recyclabilite, initialRecycl, "The recyclability should not have been updated")
}

func TestSameFamily(t *testing.T) {

	var initialRecycl float64 = 0.44
	mat := models.MatiereDB{
		Recyclabilite: initialRecycl,
		Matieres: []models.SubMater{
			{ID: "id1", Rate: 0.2},
			{ID: "id2", Rate: 0.8},
		},
	}
	indexedSubMats := SubmatersDB{
		"id1": {Famille: "metal", Recyclabilite: 0},
		"id2": {Famille: "metal", Recyclabilite: 1},
	}

	ComputeRecyclabilite(&mat, indexedSubMats)

	tu.ExpectDiffF(t, mat.Recyclabilite, initialRecycl, "The recyclability should have been updated")
	tu.ExpectEqualF(t, mat.Recyclabilite, 0.8, "Wrong recyclability computation")
}

func TestDifferentFabric(t *testing.T) {

	mat := models.MatiereDB{
		Matieres: []models.SubMater{
			{ID: "id1", Rate: 0.2},
			{ID: "id2", Rate: 0.8},
		},
	}
	indexedSubMats := SubmatersDB{
		"id1": {
			Famille:       "laine",
			ConsoEau:      1,
			CoutEnv:       2,
			ScorePEF:      3,
			Recyclabilite: 1,
		},
		"id2": {
			Famille:       "soie",
			ConsoEau:      2,
			CoutEnv:       3,
			ScorePEF:      4,
			Recyclabilite: 0.5,
		},
	}

	ComputeRecyclabilite(&mat, indexedSubMats)

	tu.ExpectEqualF(t, mat.ConsoEau, 1.8, "Wrong ConsoEau computation")
	tu.ExpectEqualF(t, mat.CoutEnv, 2.8, "Wrong CoutEnv computation")
	tu.ExpectEqualF(t, mat.ScorePEF, 3.8, "Wrong ScorePEF computation")
	tu.ExpectEqualF(t, mat.Recyclabilite, 0.3, "Wrong Recyclabilite computation")
}

func TestFabricLightContamination(t *testing.T) {

	mat := models.MatiereDB{
		Matieres: []models.SubMater{
			{ID: "id1", Rate: 0.03},
			{ID: "id2", Rate: 0.97},
		},
	}
	indexedSubMats := SubmatersDB{
		"id1": {Famille: "metal", Recyclabilite: 1},
		"id2": {Famille: "soie", Recyclabilite: 0.5},
	}

	ComputeRecyclabilite(&mat, indexedSubMats)

	tu.ExpectEqualF(t, mat.Recyclabilite, 0.103, "Wrong recyclability computation")
}

func TestFabricHeavyContamination(t *testing.T) {

	mat := models.MatiereDB{
		Matieres: []models.SubMater{
			{ID: "id1", Rate: 0.04},
			{ID: "id2", Rate: 0.96},
		},
	}
	indexedSubMats := SubmatersDB{
		"id1": {Famille: "metal", Recyclabilite: 1},
		"id2": {Famille: "soie", Recyclabilite: 0.5},
	}

	ComputeRecyclabilite(&mat, indexedSubMats)

	tu.ExpectEqualF(t, mat.Recyclabilite, 0, "Wrong recyclability computation")
}
