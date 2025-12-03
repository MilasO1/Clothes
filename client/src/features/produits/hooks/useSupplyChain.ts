import { useState } from "react"

interface procedesInput {
	country: string
	name: string
	type: string
}

const procedesSeq = [
	{ type: "filature", name: "Filature" },
	{ type: "tissage-tricotage", name: "Tissage / Tricotage" },
	{ type: "teinture", name: "Teinture" },
	{ type: "confection", name: "Confection" },
]

export function useSupplyChain() {
	const [procedeRows, setProcedeSelections] = useState<procedesInput[]>(
		procedesSeq.map(proc => ({
			country: "---",
			...proc,
		}))
	)

	const [airTransportPercent, setAirTransportPercent] = useState(0)

	const updateProcede = (procedeType: string, countryCode: string) => {
		setProcedeSelections(prev => {
			const match = prev.find(proc => proc.type === procedeType)
			if (match) {
				match.country = countryCode
			} else {
				console.log("Should not happen", procedeType)
			}
			return [...prev]
		})
	}

	const updateAirTransportPercent = (ratio: number) => {
		setAirTransportPercent(ratio)
	}

	const resetSupplyChain = () => {
		setProcedeSelections(
			procedesSeq.map(proc => ({
				country: "---",
				...proc,
			}))
		)
		setAirTransportPercent(0)
	}

	return {
		procedeRows,
		airTransportPercent,
		updateProcede,
		updateAirTransportPercent,
		resetSupplyChain,
	}
}
