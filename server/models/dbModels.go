package models

type ComposantDB struct {
	Resource      `bson:",inline"`
	Nom           string   `json:"nom"`
	Reference     string   `json:"reference,omitempty"`
	Matiere       string   `json:"matiere"`
	Type          string   `json:"type"`
	Procedes      []string `json:"procedes,omitempty"`
	PrixUnitaire  float64  `json:"prixUnitaire"`
	Monnaie       string   `json:"monnaie"`
	MasseUnitaire float64  `json:"masseUnitaire"` // [kg / unité], toujours kg
	Unite         string   `json:"unite"`         // piece, m², yard, ...
}

// Mixed with matiere
type ComposantForAnalysis struct {
	Composant `bson:",inline"`
	Matiere   Matiere `json:"matiereDetails"`
	//MasseKg   float64 `json:"masseKg,omitempty"`
}

// Gathers matiere, procede with quantities
type ComposantForImpact struct {
	ID           string    `json:"id,omitempty"`
	MassUnitaire float64   `json:"masseUnitaire"`
	Unite        string    `json:"unite,omitempty"`
	Matiere      string    `json:"matiere,omitempty"`
	Expanded     []Matiere `json:"expanded,omitempty"`
}

type SubMater struct {
	ID   string  `json:"id"`
	Rate float64 `json:"rate"`
}

type MatiereDB struct {
	Resource       `bson:",inline"`
	Nom            string     `json:"nom"`
	Famille        string     `json:"famille"`
	IdEcobalyse    string     `json:"idEcobalyse,omitempty"`
	Label          string     `json:"label,omitempty"`
	Matieres       []SubMater `json:"matieres,omitempty"`
	Reference      string     `json:"reference,omitempty"`
	TypologieFibre string     `json:"typologieFibre,omitempty"`

	// Eco indicators
	ConsoEau           float64 `json:"consoEau"`
	CoutEnv            float64 `json:"coutEnv"`
	ComplemMicrofibres float64 `json:"complemMicrofibres"`
	Recyclabilite      float64 `json:"recyclabilite"`
	Recyclee           bool    `json:"recyclee"`
	ScorePEF           float64 `json:"scorePEF"`

	TypesComposant []string `json:"typesComposant,omitempty"` // In which composant we can use it (to be challenged)
}

type Procede struct {
	Resource `bson:",inline"`
	Type     string `json:"type,omitempty"`
}

type Composition struct {
	ComposantID string                `json:"composantId,omitempty"`
	Nombre      float64               `json:"nombre"` // (Nombre & Unite) font la "quantité". Le mot quantité seul est trop ambivalent, à éviter
	Unite       string                `json:"unite"`
	Composant   *ComposantForAnalysis `json:"compo,omitempty" bson:"-"` // Optionel et non sauvegardé en DB
}

func (this Composition) GetCompoID() string { return this.ComposantID }

type ProduitDB struct {
	Resource      `bson:",inline"`
	Nom           string             `json:"nom"`
	Reference     string             `json:"reference,omitempty"`
	Bom           string             `json:"bom,omitempty"`
	Circularite   ProduitCircularity `json:"circularite,omitempty"`
	Compositions  []Composition      `json:"compositions"`
	Recyclabilite float64            `json:"recyclabilite,omitempty"`
	Type          string             `json:"type"`
}

type FamillyRecyclability struct {
	TotalMass  float64 `json:"totalMass"`
	RecyclMass float64 `json:"recyclMass"`
}

type ProduitCircularity = map[string]FamillyRecyclability

// To apply on lists, like in JS
func Map[T, V any](ts []T, fn func(T) V) []V {
	result := make([]V, len(ts))
	for idx, elem := range ts {
		result[idx] = fn(elem)
	}
	return result
}

func Filter[T any](ts []T, fn func(T) bool) []T {
	result := []T{}
	for _, elem := range ts {
		if fn(elem) {
			result = append(result, elem)
		}
	}
	return result
}

type Resourcer interface {
	getID() string
	getOrga() string
}

type Resource struct {
	ID   string `json:"id,omitempty"`
	Orga string `json:"orga,omitempty"`
}

func (this Resource) getID() string   { return this.ID }
func (this Resource) getOrga() string { return this.Orga }

func GetIDs[T Resourcer](resources []T) []string {
	return Map(resources, T.getID)
}

func FindByID[T Resourcer](id string, resources []T) *T {
	for _, rsc := range resources {
		if rsc.getID() == id {
			return &rsc
		}
	}
	return nil
}
