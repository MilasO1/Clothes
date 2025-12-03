package api

import (
	"backend/auth"
	"backend/business"
	"backend/db"
	"backend/models"
	"bytes"
	"encoding/json"
	"log/slog"
	"math"
	"net/http"
	"os"
	"slices"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type MatEcobalInput struct {
	IdEcobalyse string  `json:"id"` // This time it is ecobalyse ID, not ours
	Country     string  `json:"country"`
	Share       float64 `json:"share"`
	mass        float64 // Temporarly used before normalisation
	darwieID    string  // Darwie usual ID, for mapping, TODO support many ecobalyse matiere comming from different origins
}

func Rd(x float64, digits int) float64 {
	factor := math.Pow(10, float64(digits))
	return math.Round(x*factor) / factor
}

var PostProduitImpact = MakeHandlerFunc(func(req *http.Request) (int, any) {
	produitID := req.PathValue("produitId")
	user := auth.GetUser(req)

	prodDB, err := findOne[models.ProduitDB](db.Produits, produitID, user.Orga, bson.M{})
	prod := &prodDB
	if err != nil {
		slog.Info("Produit not found", "error", err)
		return http.StatusNotFound, "Produit not found"
	}

	inputBody := models.ImpactInput{}

	err = json.NewDecoder(req.Body).Decode(&inputBody) // High-level merge of the data structures
	if err != nil {
		slog.Info("Could not decode the body")
		return http.StatusBadRequest, "Invalid body"
	}

	// List the produit's associated resources and match them with the inputBody
	composImpact, err := listCompoForImpacts(user.Orga, prod)
	if err != nil {
		slog.Error("Unable to get the composant data", "error", err)
		return http.StatusInternalServerError, nil
	}

	// TODO: optimize these 2 DB calls into one maybe
	err = addCompoForAnalysis(user.Orga, prod)
	if err != nil {
		return http.StatusInternalServerError, nil
	}

	// Build Ecobalyse call
	ecobalInput := struct {
		Mass      float64          `json:"mass"`
		Product   string           `json:"product"`
		Materials []MatEcobalInput `json:"materials"`

		// procédés
		AirTransportRatio float64 `json:"airTransportRatio"`
		CountryDyeing     string  `json:"countryDyeing"`
		CountryFabric     string  `json:"countryFabric"`
		CountryMaking     string  `json:"countryMaking"`
		CountrySpinning   string  `json:"countrySpinning"`
	}{
		Product: prod.Type,
	}

	var prodMass float64 = 0

	for _, composi := range prod.Compositions {

		// Match the composition to the composant impact details
		compoIdx := slices.IndexFunc(composImpact, func(item models.ComposantForImpact) bool { return composi.ComposantID == item.ID })
		if compoIdx == -1 {
			return http.StatusInternalServerError, "Component ID does not exist"
		}
		compo := &composImpact[compoIdx]

		compoMass, _ := business.CompositionMass(&composi)

		flatMats := business.FlattenToPure(compo.Matiere, compo.Expanded)

		for _, pureMat := range flatMats {

			matMass := compoMass * pureMat.Rate

			idx := slices.IndexFunc(ecobalInput.Materials, func(matEco MatEcobalInput) bool {
				return matEco.IdEcobalyse == pureMat.Matiere.IdEcobalyse
			})

			if idx != -1 { // Aggregate if material already registered via another compo
				ecobalInput.Materials[idx].mass += matMass
			} else {
				ecobalInput.Materials = append(ecobalInput.Materials, MatEcobalInput{
					darwieID:    pureMat.Matiere.ID,
					IdEcobalyse: pureMat.Matiere.IdEcobalyse,
					mass:        matMass,
				})
			}
		}
		prodMass += compoMass
	}

	ecobalInput.Mass = prodMass

	if prodMass == 0 {
		return http.StatusInternalServerError, "Product mass is null"
	}

	for idx := range ecobalInput.Materials {
		ecobalMat := &ecobalInput.Materials[idx]
		ecobalMat.Share = Rd(ecobalMat.mass/prodMass, 6)

		idxInput := slices.IndexFunc(inputBody.Matieres, func(resCtry models.MatiereCountry) bool {
			return resCtry.ID == ecobalMat.darwieID
		})

		if idxInput == -1 {
			return http.StatusBadRequest, "Missing country for matiere " + ecobalMat.darwieID
		} else {
			ecobalMat.Country = inputBody.Matieres[idxInput].Country
		}
	}

	ecobalInput.AirTransportRatio = inputBody.AirTransportRatio

	for _, proc := range inputBody.Procedes {
		switch proc.Type {
		case "teinture":
			ecobalInput.CountryDyeing = proc.Country
		case "tissage-tricotage":
			ecobalInput.CountryFabric = proc.Country
		case "confection":
			ecobalInput.CountryMaking = proc.Country
		case "filature":
			ecobalInput.CountrySpinning = proc.Country
		default:
			return http.StatusBadRequest, "Procédé inconnu " + proc.Type
		}
	}

	jsonBody, _ := json.Marshal(ecobalInput)
	reqBody := bytes.NewReader(jsonBody)

	// out2, _ := json.MarshalIndent(ecobalInput, "", "\t")
	// fmt.Println("🎃🎃🎃", string(out2))

	ecobalUrl := os.Getenv("ECOBALYSE_URL")
	ecobalToken := os.Getenv("ECOBALYSE_TOKEN")

	client := http.Client{Timeout: 10 * time.Second}
	ecobalReq, _ := http.NewRequest("POST", ecobalUrl+"/api/textile/simulator", reqBody)

	ecobalReq.Header.Set("Content-Type", "application/json")
	ecobalReq.Header.Set("Token", ecobalToken)

	// send the request
	res, err := client.Do(ecobalReq)
	if err != nil || res == nil {
		slog.Info("Ecobalyse call error", "error", err)
		return http.StatusFailedDependency, err
	}
	if res.StatusCode != http.StatusOK {
		slog.Info("Ecobalyse call KO", "code", res.StatusCode)
		return http.StatusFailedDependency, err
	}

	contentType := res.Header.Get("Content-Type")
	if !strings.Contains(contentType, "application/json") {
		slog.Info("Not json response")
		return http.StatusFailedDependency, err
	}

	ecobalOutput := struct {
		Impacts struct {
			ECS float64 `json:"ecs"`
			PEF float64 `json:"pef"`
		} `json:"impacts"`
	}{}
	defer res.Body.Close()
	err = json.NewDecoder(res.Body).Decode(&ecobalOutput)
	if err != nil {
		slog.Info("Could not decode Ecobalyse response body", "error", err)
		return http.StatusFailedDependency, err
	}

	//   "countrySpinning": "FR",
	//   "countryFabric": "FR",
	//   "countryDyeing": "FR",
	//   "countryMaking": "FR",
	//   "fabricProcess": "knitting-mix"

	return http.StatusOK, ecobalOutput.Impacts
})

type PureMatOut struct {
	ID          string `json:"id"` // Darwie's
	IdEcobalyse string `json:"idEcobalyse"`
	Nom         string `json:"nom"`
}

func containsMat(mats []PureMatOut, id string) bool {
	return slices.ContainsFunc(mats, func(pure PureMatOut) bool {
		return pure.ID == id
	})
}

var GetProduitPureMatieres = MakeHandlerFunc(func(req *http.Request) (int, any) {
	produitID := req.PathValue("produitId")
	user := auth.GetUser(req)

	prodDB, err := findOne[models.ProduitDB](db.Produits, produitID, user.Orga, bson.M{})
	prod := &prodDB
	if err != nil {
		slog.Info("Produit not found", "error", err)
		return http.StatusNotFound, "Produit not found"
	}

	// List the produit's associated resources
	composImpact, err := listCompoForImpacts(user.Orga, prod)
	if err != nil {
		slog.Error("Unable to get the composant data", "error", err)
		return http.StatusInternalServerError, nil
	}

	result := []PureMatOut{}

	for _, compo := range composImpact {
		for _, mat := range compo.Expanded {
			if len(mat.Matieres) == 0 && !containsMat(result, mat.ID) && !strings.HasPrefix(mat.IdEcobalyse, "custom-") { // pure
				result = append(result, PureMatOut{
					ID:          mat.ID,
					IdEcobalyse: mat.IdEcobalyse,
					Nom:         mat.Nom,
				})
			}
		}
	}

	return http.StatusOK, result

})
