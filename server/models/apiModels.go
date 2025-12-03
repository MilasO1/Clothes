package models

// Mere aliases that could be updated in the future when the API differs from the DB
type Composant = ComposantDB

type Matiere = MatiereDB

type Produit = ProduitDB

type MatiereCountry struct {
	ID      string `json:"id"`
	Country string `json:"country"`
}
type ProcodeCountry struct {
	Type    string `json:"type"`
	Country string `json:"country"`
}

type ImpactInput struct {
	Matieres          []MatiereCountry `json:"matieres"`
	Procedes          []ProcodeCountry `json:"procedes"`
	AirTransportRatio float64          `json:"airTransportRatio"`
}
