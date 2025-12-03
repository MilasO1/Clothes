
import { createRsc, rd, toFloat, toInt } from "./utils"

const nomencToType = {
	"MATIERE PRINCIPALE": "etoffe",
	"MATIERE SECONDAIRE": "etoffe",
	"FOURNITURES": "accessoire",
	"ZIP": "accessoire",
}

function getType(nomenclature) {
	return nomencToType[nomenclature] || "etoffe"
}

const unitsMap = {
	"PCE": "piece",
	"M2": "m²",
	"Kg": "kg",
	"Gr": "g",
}

function getUnite(line) {
	const customUnit = line["Unité"]
	const laize = toInt(line["Laize Utile (cm)"]) // On va devoir choisir laize reelle ou utile

	if(customUnit === "M") {
		if(laize === 0) { return "piece" }
		return "m-" + laize
	}

	return unitsMap[customUnit] || "g"
}

function getMasseUnit(line){

	const customUnit = line["Unité"]
	if(customUnit === "PCE") {
		return toFloat(line["Poids (Gr)"]) / 1000
	}
	else if(customUnit === "M") {
		return toFloat(line["Poids (Gr/Mt)"]) / 1000 // On va devoir choisir laize reelle ou utile
	}
}

export async function parse(data, baseMatieres) {

	//console.log(baseMatieres)

	let currProd, currCompo
	let currMats = []


	const saveMatsAndCompo = async () => {
		if (!currCompo) { return }
		console.log("End compo", currCompo.nom)

		let matIdInCompo

		// First, create composite matieres or get the pure id
		if (currMats.length > 1) {
			const matBody = {
				nom: currMats.map(mat => mat.customNom.slice(0, 6) + " " + rd(mat.rate * 100, 0) + "%").join(" - "),
				matieres: currMats.map(({id, rate}) => ({id, rate})),
			}
			matIdInCompo = await createRsc("matieres", matBody).then(resp => {
				if(resp.ok) {
					return resp.json()
				}
			})
		} else {
			matIdInCompo = currMats[0].id
		}

		// Then composant with matiereId
		currCompo.matiere = matIdInCompo
		const composantId = await createRsc("composants", currCompo).then(resp => {
			if(resp.ok) {
				return resp.json()
			}
		})

		currProd.compositions[currProd.compositions.length - 1].composantId = composantId
		currCompo = undefined
		currMats = []
	}

	const saveProd = async () => {
		if (!currProd) { return }
		console.log("End prod", currProd.nom)
		await createRsc("produits", currProd)
		currProd = undefined
	}

	for(const line of data) {
		//console.log(line)

		// Sanity checks
		const prodRef = line["Ref. Hermès"]
		if (!prodRef) { continue }

		const compoRef = line["Ref. Hermès Composant"]
		if (!compoRef) { continue }
		
		const matName = line["Matière"].toLowerCase().replace("elasthanne", "elasthane")
		const matId = baseMatieres.find(m => m.nom.toLowerCase().includes(matName))?.id

		if (!matId) {
			console.log("❌ Could not find matiere", line["Matière"], matName)
			continue
		}

		// End of compo lines: save the previous current and re-init a new one
		if (currCompo && currCompo.reference !== compoRef) {
			await saveMatsAndCompo()
		}
		
		// Save the previous current and re-init a new one
		if (currProd && currProd.reference !== prodRef) {
			await saveProd()
		}

		// Now we look at the current line
		if(!currProd) {
			currProd = {
				reference: prodRef,
				nom: line["Produit fini"].replace(prodRef + "-", "").toLowerCase(),
				type: "manteau",
				compositions: [],
			}
		}

		if(!currCompo) {
			const unite = getUnite(line)
			currCompo = {
				reference: compoRef,
				nom: line["Désignation Courte Hermès"].toLowerCase(),
				type: getType(line["Section de Nomenclature"]),
				unite: unite,
				masseUnitaire: getMasseUnit(line)
			}
			currProd?.compositions.push({
				nombre: toFloat(line["Quantité"]),
				unite: currCompo.unite,
			})
		}
		
		currMats.push({
			customNom: matName,
			id: matId,
			rate: toFloat(line["Pourcentage matière"])
		})
	}


	await saveMatsAndCompo()
	await saveProd()
}