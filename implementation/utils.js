
export const headers = {
	"X-DARWIE-APIKEY": "local-apikey",
	//"Cookie": "session=aaa",
	"Content-Type": "application/json",
}

export const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

export function createRsc(rscType, body) {
	return fetch(backendUrl + "/api/" + rscType, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	}).then(resp => {
		if(!resp.ok) {
			console.log("❌ Error creating", JSON.stringify(body, null, "\t"))
		}
		return resp
	})
}


export function rd(num, pow = 2) {
	return Math.round(num * 10**pow) / 10**pow
}

export function toFloat(nbStr) {
	return rd(parseFloat(nbStr), 2)
}

export function toInt(nbStr) {
	return Math.round(parseInt(nbStr))
}
