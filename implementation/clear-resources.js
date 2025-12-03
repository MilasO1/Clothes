#! /usr/bin/env bun

import {backendUrl, headers} from "./utils"
import { clearMocks } from "./populate-mocks"

const resources = ["produits", "composants", "matieres"]

async function main() {

	if(!backendUrl.startsWith("http://localhost")) {
		const answer = prompt(`Vous ciblez ${backendUrl}, continuer? (yes/no):`);
		if (answer !== "yes") {
			console.log("Annulé")
			process.exit(1)
		}
	}

	for(let idx=0; idx<3; idx++) { // Multi retries for clearing dependants before retrying clearing dependencies

		for(const rscType of resources) {
			const resources = await fetch(backendUrl + "/api/" + rscType, { headers }).then(r => r.json())
			for(const rsc of resources) {
				const respDel = await fetch(backendUrl + "/api/" + rscType + "/" + rsc.id, {
					method: "DELETE",
					headers,
				})

				console.log("Resp for deletion of", rscType, rsc.id, respDel.ok)
			}
		}
	}

	clearMocks()
}

main()