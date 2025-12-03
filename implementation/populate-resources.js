#! /usr/bin/env bun
import { createReadStream } from "fs"
import { once } from "events"
import csv from "csv-parser"

import { backendUrl, headers, createRsc, rd, toFloat } from "./utils"
import { parse as parseCustom } from "./parse-custom"
import { populateMocks } from "./populate-mocks"

const localDev = process.argv.length > 2 && process.argv[2] === "local"
const custom = process.argv.length > 2 && process.argv[2] === "custom"


export async function readFileStream(path) {
	const chunks = [];
	const stream = createReadStream(path)
		.pipe(csv())
		.on("data", chunk => chunks.push(chunk));

	// Wait until the stream ends
	await once(stream, "end")
	return chunks
}


/*
artificielle
naturelle
synthetique
mix
*/
function getTypologie(origine) {
	return origine.includes("artificielle") ? "artificielle" :
		origine.includes("synthétique") ? "synthetique" : "naturelle"
}

/* 
- coton
- cuir
- elasthanne
- jute
- laine
- melange-matieres
- metal
- plastique
- polyester
- soie
*/
function getFamille(nom) {
	return nom.includes("chanvre") ? "chanvre" :
		nom.includes("coton") ? "coton" :
		nom.includes("cuir") ? "cuir" :
		nom.includes("elast") ? "elasthane" :
		nom.includes("gomme") ? "gomme" :
		nom.includes("jute") ? "jute" :
		nom.includes("laine") ? "laine" :
		nom.includes("lin") ? "lin" :
		nom.includes("cuivre") ? "metal" :
		nom.includes("laiton") ? "metal" :
		nom.includes("acier") ? "metal" :
		nom.includes("zamak") ? "metal" :
		nom.includes("polyester") ? "polyester" :
		nom.includes("soie") ? "soie" :
		nom.includes("viscose") ? "viscose" : "plastique"
}

function randElem(list) {
	return list[Math.floor(Math.random() * list.length)]
}
function randNb(max) {
	return Math.floor(Math.random() * max)
}


const composantType = ["etoffe", "accessoire", "impression-broderie", "etiquette"]
const produitType = ["calecon", "chaussettes", "chemise", "jean", "jupe", "maillot-de-bain", "manteau", "pantalon", "pull", "slip", "tshirt"]
const units = ["kg", "g", "m²", "yard", "piece"]
const massUnits = ["kg", "g"]
const nonMassUnits = units.filter(mass => !massUnits.includes(mass))

async function main() {

	const ecobalyseData = await readFileStream("ecobalyse-textile-materials.csv")
	// console.log(ecobalyseData[0])

	const materialCreationBodies = ecobalyseData.map(data => {
		return {
			nom: data.Nom,
			idEcobalyse: data.Identifiant,
			famille: getFamille(data.Nom.toLowerCase()),
			recyclee: data["Recyclée ?"] == "oui",
			complemMicrofibres: toFloat(data["Complément Microfibres"].replace("-", "")),
			typologieFibre: getTypologie(data.Origine)
		}
	})

	console.log(ecobalyseData.map(data => data.Nom))

	const baseAcvData = await readFileStream("base-acv-materials.csv")
	console.log(baseAcvData[0])

	for(const mat of materialCreationBodies) {

		//const res = materialsEcobalyse.find(elem => elem.id === mat.idEcobalyse)
		const acv = baseAcvData.find(elem => elem["Identifiant Ecobalyse"] === mat.idEcobalyse)
		if(!acv){
			console.log("No match for", mat)
			continue
		}

		mat.consoEau = toFloat(acv["Utilisation de ressouces en eau (m³e)"]) * 1000
		mat.coutEnv = toFloat(acv["Coût environnemental (Pts)"])
		mat.scorePEF = toFloat(acv["Score PEF (µPt PEF)"])
		mat.recyclabilite = toFloat(acv["Recyclabilite"])

		const matID = await createRsc("matieres", mat).then(resp => {
			if(resp.ok) {
				return resp.json()
			}
		})
		if(matID) {
			console.log("New mat ID", matID, "for", mat.nom)
		}
	}

	const baseMatieres = await fetch(backendUrl + "/api/matieres", { headers }).then(r => r.json())

	if(custom) {
		const nomenclatureCustom = await readFileStream("nomenclature-custom.csv")
		await parseCustom(nomenclatureCustom, baseMatieres)
		return
	}

	if(!localDev) { return }

	const polyesterMat = baseMatieres.find(m => m.nom.includes("Polyester recy")).id
	const laineMat = baseMatieres.find(m => m.nom.includes("Laine nouvelle")).id

	const matBodies = [
		{
			nom: "Laine-Polyester",
			matieres: [{
					id: laineMat,
					rate: 0.65
				},
				{
					id: polyesterMat,
					rate: 0.35
				},
			],
		},
		{
			nom: "Matière méli-mélo",
			matieres: baseMatieres.slice(0, 10).map(mat => ({
				id: mat.id,
				rate: 0.1,
			})),
		},
	]
	for(const body of matBodies) {
		await createRsc("matieres", body)
	}

	const matieres = await fetch(backendUrl + "/api/matieres", { headers }).then(r => r.json())

	const lainePolyMat = matieres.find(m => m.nom.includes("Laine-Polyester")).id
	const cotonMat = matieres.find(m => m.nom.includes("Coton recy")).id
	const acrylMat = matieres.find(m => m.nom.includes("Acrylique")).id
	const cuirMat = matieres.find(m => m.nom.includes("Cuir")).id
	const linMat = matieres.find(m => m.nom.includes("Lin")).id

	const compoBodies = [
		{
			nom: "Tricot de laine",
			matiere: lainePolyMat,
			type: "etoffe",
			prixUnitaire: 0.05,
			monnaie: "€",
			masseUnitaire: 0.08,
			unite: "cm²",
		},
		{
			nom: "Long zip",
			matiere: polyesterMat,
			type: "accessoire",
			prixUnitaire: 0.2,
			monnaie: "€",
			masseUnitaire: 0.02,
			unite: "piece"
		},
		{
			nom: "Cuir de mouton",
			matiere: cuirMat,
			type: "etoffe",
			prixUnitaire: 58,
			monnaie: "€",
			masseUnitaire: 2.9,
			unite: "m²"
		},
		{
			nom: "Ecusson en cuir",
			matiere: cuirMat,
			type: "accessoire",
			prixUnitaire: 65,
			monnaie: "€",
			masseUnitaire: 3,
			unite: "m²"
		},
		{
			nom: "Tissu denim",
			matiere: cotonMat,
			type: "etoffe",
			prixUnitaire: 23,
			monnaie: "€",
			masseUnitaire: 3,
			unite: "yard"
		},
		{
			nom: "Tissu de lin",
			matiere: linMat,
			type: "etoffe",
			prixUnitaire: 7,
			monnaie: "€",
			masseUnitaire: 0.6,
			unite: "m²"
		},
		{
			nom: "Impression",
			matiere: acrylMat,
			type: "impression-broderie",
			prixUnitaire: 0.1,
			monnaie: "€",
			masseUnitaire: 0.001,
			unite: "cm²"
		},
		...matieres.map((mat, idx) => {
			const type = composantType[idx % composantType.length]
			return {
				nom: type + " - " + mat.nom.slice(0, 20),
				matiere: mat.id,
				type,
				prixUnitaire: (idx % 30) * 0.1, // Some have zero, we test that we support it
				monnaie: "€",
				masseUnitaire: (idx % 20)/100, // Some have zero, we test that we support it
				unite: nonMassUnits[idx % nonMassUnits.length],
			}
		})
	]

	for(const body of compoBodies) {
		await createRsc("composants", body)
	}
	
	const composants = await fetch(backendUrl + "/api/composants", { headers }).then(r => r.json())

	const composByType = {}
	for (const compo of composants){
		if (compo.type in composByType) {
			composByType[compo.type].push(compo)
		} else {
			composByType[compo.type] = [compo]
		}
	}

	const ecussonCompo = composants.find(m => m.nom.includes("Ecusson"))
	const tricotCompo = composants.find(m => m.nom.includes("Tricot"))
	const denimCompo = composants.find(m => m.nom.includes("denim"))
	const cuirCompo = composants.find(m => m.nom.includes("Cuir de"))
	const zipCompo = composants.find(m => m.nom.includes("zip"))
	const lincompo = composants.find(m => m.nom.includes("lin"))

	const prods = [
		{
			nom: "Manteau méli-mélo",
			type: "manteau",
			compositions: composants.slice(0, 10).map((compo, idx) => ({
				composantId: compo.id,
				nombre: idx%5,
				unite: compo.unite,
			})),
		},
		{
			nom: "Tshirt en laine",
			type: "tshirt",
			compositions: [{
				composantId: tricotCompo.id,
				nombre: 0.4,
				unite: tricotCompo.unite,
			},
			{
				composantId: lincompo.id,
				nombre: 0.3,
				unite: lincompo.unite,
			}],
		},
		{
			nom: "Blouson en cuir",
			type: "manteau",
			compositions: [{
				composantId: cuirCompo.id,
				nombre: 0.6,
				unite: cuirCompo.unite,
			}, {
				composantId: zipCompo.id,
				nombre: 1,
				unite: zipCompo.unite,
			}],
		},
		{
			nom: "Jean denim délavé",
			type: "pantalon",
			compositions: [{
				composantId: denimCompo.id,
				nombre: 0.5,
				unite: denimCompo.unite,
			}, {
				composantId: zipCompo.id,
				nombre: 1,
				unite: zipCompo.unite,
			}],
		},
		{
			nom: "Pull de Noël",
			type: "pull",
			compositions: [{
				composantId: tricotCompo.id,
				nombre: 1,
				unite: tricotCompo.unite,
			}, {
				composantId: ecussonCompo.id,
				nombre: 1,
				unite: ecussonCompo.unite,
			}],
		},
		{
			nom: "Robe à fleurs",
			type: "robe",
			compositions: [{
				composantId: lincompo.id,
				nombre: 0.7,
				unite: lincompo.unite,
			}],
		},

		...Array.from({ length: 15 }).map(() => {
			const type = randElem(produitType)

			// Picking random compos
			const pickedCompos = []
			let suffix = ""
			Object.values(composByType).map(compos => {

				//console.log(compos)
				const nb = randNb(2) + 1
				for(let idx = 0; idx < nb; idx++) {
					const compo = randElem(compos)
					//console.log(compo)
					pickedCompos.push(compo)
					if (suffix == "") {
						if(compo.nom.includes(" - ")) {
							suffix = compo.nom.slice(compo.nom.lastIndexOf(" - ") + 3)
						}
						else {
							suffix = compo.nom
						}
					}
				}
			})

			const body =  {
				nom: (type + " en " + suffix).toLowerCase(),
				type,
				compositions: pickedCompos.map(compo => ({
					composantId: compo.id,
					nombre: rd(Math.random()),
					unite: compo.unite,
				})),
			}

			//console.log(body)
			return body
		})
		
	]

	for(const body of prods) {
		await createRsc("produits", body)
	}

	await populateMocks()

}

main()
