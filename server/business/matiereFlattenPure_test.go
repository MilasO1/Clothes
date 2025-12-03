package business

import (
	"backend/models"
	tu "backend/test-utils"
	"testing"
)

func TestFlattenHappyCase(t *testing.T) {
	// Easy
	mats := []models.Matiere{
		{},
	}
	mats[0].ID = "A"

	result := FlattenToPure("A", mats)

	tu.ExpectEqual(t, len(result), 1, "Wrong length")
	tu.ExpectEqual(t, result[0].Matiere.ID, "A", "Wrong pure[0] ID")
	tu.ExpectEqualF(t, result[0].Rate, 1, "Wrong pure[0] rate")

	// Hard
	mats = []models.Matiere{
		{
			Matieres: []models.SubMater{
				{
					ID:   "B",
					Rate: 0.4,
				},
				{
					ID:   "C",
					Rate: 0.1,
				},
				{
					ID:   "D",
					Rate: 0.5,
				},
			},
		},
		{},
		{
			Matieres: []models.SubMater{
				{
					ID:   "D", // Double ref, should sum
					Rate: 0.1,
				},
				{
					ID:   "E",
					Rate: 0.9,
				},
			},
		},
		{},
		{},
	}
	mats[0].ID = "A"
	mats[1].ID = "B"
	mats[2].ID = "C"
	mats[3].ID = "D"
	mats[4].ID = "E"

	result = FlattenToPure("A", mats)

	tu.ExpectEqual(t, len(result), 3, "Wrong length")
	tu.ExpectEqual(t, result[0].Matiere.ID, "B", "Wrong pure[0] ID")
	tu.ExpectEqualF(t, result[0].Rate, 0.4, "Wrong pure[0] rate")

	tu.ExpectEqual(t, result[1].Matiere.ID, "D", "Wrong pure[1] ID")
	tu.ExpectEqualF(t, result[1].Rate, 0.51, "Wrong pure[1] rate")

	tu.ExpectEqual(t, result[2].Matiere.ID, "E", "Wrong pure[2] ID")
	tu.ExpectEqualF(t, result[2].Rate, 0.09, "Wrong pure[2] rate")
}
