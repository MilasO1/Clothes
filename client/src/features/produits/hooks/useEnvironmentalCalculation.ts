import api from "@/contexts/apiQueries"
import type { ImpactResult } from "@/features/produits/types/index"

export function useEnvironmentalCalculation(produitId: string) {
	const impactMutation = api.produits.calculateImpact(produitId)

	const calculateImpact = (matCountries, procCountries, airTransportPercent) => {
		impactMutation.mutate({
			matieres: matCountries.map(mat => ({ id: mat.id, country: mat.country })),
			procedes: procCountries.map(proc => ({ type: proc.type, country: proc.country })),
			airTransportRatio: airTransportPercent / 100,
		})
	}

	return {
		calculateImpact,
		impactResults: impactMutation.data as ImpactResult | undefined,
		isCalculating: impactMutation.isPending,
		error: impactMutation.error,
	}
}
