import type { Composition, Produit } from "@/features/produits/types"
import type { Matiere } from "@/features/matieres/types"
import { rd } from "@/components/utils"

// Inline with server's produitCircularite.go
const unitsDimension = {
	kg: "mass",
	g: "mass",
	"m²": "surface",
	"cm²": "surface",
	"m-140": "surface",
	"m-135": "surface",
	yard: "surface",
	piece: "number",
}

const unitConversionSI = {
	kg: 1,
	g: 0.001,
	"m²": 1,
	"cm²": 0.0001,
	"m-140": 1.4,
	"m-135": 1.35,
	yard: 0.91 * 1.5,
	piece: 1,
}

// The units having the same dimension as the input
export function getCompatible(unit) {
	const dim = unitsDimension[unit]
	return Object.keys(unitsDimension).filter(uni => unitsDimension[uni] === dim) //  || unitsDimension[uni] === "mass"
}

export function compositionMass(composi: Composition): { mass: number; error?: string } {
	if (unitsDimension[composi.unite] === "mass") {
		// Shortcut, we have the mass already
		return { mass: composi.nombre * unitConversionSI[composi.unite] }
	} else if (unitsDimension[composi.unite] === unitsDimension[composi.compo.unite]) {
		// Convert to SI for common ground
		return {
			mass:
				(composi.compo.masseUnitaire * composi.nombre * unitConversionSI[composi.unite]) /
				unitConversionSI[composi.compo.unite],
		}
	} else {
		return { mass: 0, error: `Unités incompatibles: ${composi.unite}, ${composi.compo.unite}` }
	}
}

// To multiply to prixUnitaire & massUnitaire
export function compFactor(composi: Composition) {
	return (composi.nombre * unitConversionSI[composi.unite]) / unitConversionSI[composi.compo.unite]
}

export function masseTotale(prod: Produit, field: string = "totalMass") {
	if (!prod?.circularite) {
		return 0
	}
	return Object.values(prod.circularite).reduce((accum, curr) => accum + curr[field], 0)
}

export function filteredMass(prod: Produit, predicate: (mat: Matiere) => boolean): number {
	let accum = 0
	for (const composi of prod.compositions) {
		if (composi.compo.matiereDetails && predicate(composi.compo.matiereDetails)) {
			const factor = compFactor(composi)
			accum += factor * composi.compo.masseUnitaire
		}
	}

	return accum
}

export const predicates = {
	responsable: (mat: Matiere) => mat.recyclee || mat.typologieFibre === "naturelle",
}

export function prettyMass(mass) {
	mass = mass || 0
	if (mass > 1) {
		return [mass.toFixed(2), "kg"]
	} else {
		return [(mass * 1000).toFixed(0), "g"]
	}
}

export function prettyPrice(factor, prixUnitaire, monnaie) {
	prixUnitaire = prixUnitaire || 0
	return rd(factor * (prixUnitaire || 0)) + " " + monnaie
}

export const ecobalyseCountries = [
	{
		code: "FR",
		name: "France",
	},
	{
		code: "BD",
		name: "Bangladesh",
	},
	{
		code: "CN",
		name: "Chine",
	},
	{
		code: "IN",
		name: "Inde",
	},
	{
		code: "KH",
		name: "Cambodge",
	},
	{
		code: "MA",
		name: "Maroc",
	},
	{
		code: "MM",
		name: "Myanmar",
	},
	{
		code: "PK",
		name: "Pakistan",
	},
	{
		code: "TN",
		name: "Tunisie",
	},
	{
		code: "TR",
		name: "Turquie",
	},
	{
		code: "VN",
		name: "Vietnam",
	},
	{
		code: "REO",
		name: "Région - Europe de l'Ouest",
	},
	{
		code: "REE",
		name: "Région - Europe de l'Est",
	},
	{
		code: "RAS",
		name: "Région - Asie",
	},
	{
		code: "RAF",
		name: "Région - Afrique",
	},
	{
		code: "RME",
		name: "Région - Moyen-Orient",
	},
	{
		code: "RLA",
		name: "Région - Amérique Latine",
	},
	{
		code: "RNA",
		name: "Région - Amérique du nord",
	},
	{
		code: "ROC",
		name: "Région - Océanie",
	},
	{
		code: "---",
		name: "Pays inconnu (par défaut)",
	},
]
