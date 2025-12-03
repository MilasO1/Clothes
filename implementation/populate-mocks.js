
import { headers } from "./utils"

export async function populateMocks() {

	const body = {
		endpoint: "POST /ecobalyse/api/textile/simulator",
		code:     200,
		headers:  {"Content-Type": ["application/json"]},
		body:     {impacts: {ecs: 1234, pef: 7894}},
	}


	return fetch("http://localhost:8081/api/responses", {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	}).then(resp => {
		if(!resp.ok) {
			console.log("❌ Error creating a mock", JSON.stringify(body, null, "\t"), resp)
		}
		return resp
	})
}

export async function clearMocks() {
	return await fetch("http://localhost:8081/api/responses", {
		method: "DELETE",
		headers,
	})
}