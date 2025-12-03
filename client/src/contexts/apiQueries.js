import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { queryClient, router } from "@/contexts/queryProvider"
import { toast } from "sonner"

export class ApiError extends Error {
	constructor(message, status) {
		super(message)
		this.status = status
		this.name = "ApiError"
	}
}

export async function request(method, url, body) {
	const response = await fetch(url, {
		method,
		body: body ? JSON.stringify(body) : undefined,
		headers: { "Content-Type": "application/json" },
	})

	if (!response.ok) {
		const data = await response.json().catch(() => ({}))
		throw new ApiError(data?.message || response.statusText, response.status)
	}

	// Handle 204 No Content responses
	if (response.status === 204) {
		return undefined
	}
	return response.json()
}

const matieresQueryKey = ["matieres", "list"]
const composantsQueryKey = ["composants", "list"]
const composantsWithDetailsQueryKey = ["composantsWithDetails", "list"]
const produitsQueryKey = ["produits", "list"]

const getOneMatiereQueryKey = prodID => [...matieresQueryKey, prodID]
const getOneComposantQueryKey = prodID => [...composantsQueryKey, prodID]
const getOneProduitQueryKey = prodID => [...produitsQueryKey, prodID]

export const listMatieresQueryOptions = {
	queryKey: matieresQueryKey,
	queryFn: () => request("GET", "/api/matieres"),
}
export const listComposantsQueryOptions = {
	queryKey: composantsQueryKey,
	queryFn: () => request("GET", "/api/composants"),
}
export const listProduitsQueryOptions = {
	queryKey: produitsQueryKey,
	queryFn: () => request("GET", "/api/produits"),
}

export function useVersion() {
	return useSuspenseQuery({ queryFn: () => request("GET", "/api/version") })
}

export default {
	matieres: {
		list: () => useSuspenseQuery(listMatieresQueryOptions),
		create: () =>
			useMutation({
				mutationFn: body => request("POST", "/api/matieres", body),
				onSuccess: (_, variables) => {
					queryClient.invalidateQueries({ queryKey: matieresQueryKey })
					queryClient.invalidateQueries({ queryKey: composantsWithDetailsQueryKey })
					toast.success(`Matière "${variables.nom}" créée`)
				},
				onError: () => {
					toast.error("Erreur lors de la création")
				},
			}),
		get: rscId =>
			useQuery({
				enabled: !!rscId,
				queryKey: getOneMatiereQueryKey(rscId),
				queryFn: () => request("GET", "/api/matieres/" + rscId),
				onError: () => {
					toast.error("Erreur lors de la récupération")
				},
			}),
		delete: () =>
			useMutation({
				mutationFn: rscId => request("DELETE", "/api/matieres/" + rscId),
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: matieresQueryKey })
					toast.success(`Matière supprimée`)
				},
				onError: error => {
					console.log("err", error)
					if (error.status === 409) {
						toast.error(`Cette matière est utilisée dans des produits, composants ou matières`)
					} else {
						toast.error(`Erreur lors de la suppression`)
					}
				},
			}),
		update: () =>
			useMutation({
				mutationFn: ({ rscId, body }) => {
					request("PUT", "/api/matieres/" + rscId, body)
				},
				onSuccess: (_, variables) => {
					queryClient.invalidateQueries({ queryKey: matieresQueryKey })
					queryClient.invalidateQueries({ queryKey: composantsWithDetailsQueryKey })
					toast.success(`Matière "${variables.body.nom}" mise à jour`)
				},
				onError: () => {
					toast.error(`Erreur lors de la mise à jour`)
				},
			}),
	},

	composants: {
		list: () => useSuspenseQuery(listComposantsQueryOptions),
		create: () =>
			useMutation({
				mutationFn: body => request("POST", "/api/composants", body),
				onSuccess: (_, variables) => {
					queryClient.invalidateQueries({ queryKey: composantsQueryKey })
					queryClient.invalidateQueries({ queryKey: composantsWithDetailsQueryKey })
					toast.success(`Composant "${variables.nom}" créé`)
				},
				onError: () => {
					toast.error("Erreur lors de la création")
				},
			}),
		get: rscId =>
			useQuery({
				enabled: !!rscId,
				queryKey: getOneComposantQueryKey(rscId),
				queryFn: () => request("GET", "/api/composants/" + rscId),
				onError: () => {
					toast.error("Erreur lors de la récupération")
				},
			}),
		delete: () =>
			useMutation({
				mutationFn: rscId => request("DELETE", "/api/composants/" + rscId),
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: composantsQueryKey })
					queryClient.invalidateQueries({ queryKey: composantsWithDetailsQueryKey })
					toast.success(`Composant supprimé`)
				},
				onError: error => {
					if (error.status === 409) {
						toast.error(`Ce composant est utilisé dans des produits`)
					} else {
						toast.error(`Erreur lors de la suppression`)
					}
				},
			}),
		update: () =>
			useMutation({
				mutationFn: ({ rscId, body }) => request("PUT", "/api/composants/" + rscId, body),
				onSuccess: (_, variables) => {
					queryClient.invalidateQueries({ queryKey: composantsQueryKey })
					queryClient.invalidateQueries({ queryKey: composantsWithDetailsQueryKey })
					toast.success(`Composant "${variables.body.nom}" mis à jour`)
				},
				onError: () => {
					toast.error(`Erreur lors de la mise à jour`)
				},
			}),
	},

	composantsWithDetails: {
		list: () =>
			useSuspenseQuery({
				queryKey: composantsWithDetailsQueryKey,
				queryFn: async () => {
					const [matieres, composants] = await Promise.all([
						request("GET", "/api/matieres"),
						request("GET", "/api/composants"),
					])
					for (const compo of composants) {
						compo.matiereDetails = matieres.find(mat => compo.matiere === mat.id)
					}

					return composants
				},
			}),
	},

	produits: {
		list: () => useSuspenseQuery(listProduitsQueryOptions),
		create: () =>
			useMutation({
				mutationFn: body => request("POST", "/api/produits", body),
				onSuccess: (rscId, variables) => {
					queryClient.invalidateQueries({
						queryKey: produitsQueryKey,
					})
					toast.success(`Produit "${variables.nom}" créé`, {
						action: {
							label: "Analyse",
							onClick: () => router.navigate({ to: `/product-analyse/${rscId}` }),
						},
					})
				},
				onError: () => {
					toast.error("Erreur lors de la création")
				},
			}),
		get: rscId =>
			useQuery({
				enabled: !!rscId,
				queryKey: getOneProduitQueryKey(rscId),
				queryFn: () => request("GET", "/api/produits/" + rscId),
				onError: () => {
					toast.error("Erreur lors de la récupération")
				},
			}),
		delete: () =>
			useMutation({
				mutationFn: rscId => request("DELETE", "/api/produits/" + rscId),
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: produitsQueryKey })
					toast.success(`Produit supprimé`)
				},
				onError: _error => {
					toast.error(`Erreur lors de la suppression`)
				},
			}),
		update: () =>
			useMutation({
				mutationFn: ({ rscId, body }) => request("PUT", "/api/produits/" + rscId, body),
				onSuccess: (_, variables) => {
					queryClient.invalidateQueries({ queryKey: produitsQueryKey })
					toast.success(`Produit "${variables.body.nom}" mis à jour`, {
						action: {
							label: "Analyse",
							onClick: () => router.navigate({ to: `/product-analyse/${variables.rscId}` }),
						},
					})
				},
				onError: () => {
					toast.error(`Erreur lors de la mise à jour`)
				},
			}),
		pureMatieres: produitId =>
			useSuspenseQuery({
				queryKey: ["pure-matieres", produitId],
				queryFn: () => request("GET", `/api/produits/${produitId}/pure-matieres`),
			}),
		calculateImpact: produitId =>
			useMutation({
				mutationFn: input => request("POST", `/api/produits/${produitId}/impact`, input),
				onSuccess: data => {
					toast.success("Calcul d'impact effectué")
					return data
				},
				onError: error => {
					toast.error("Erreur lors du calcul d'impact")
					console.error("Impact calculation error:", error)
				},
			}),
	},
	me: {
		get: () =>
			useSuspenseQuery({
				queryKey: ["me"],
				queryFn: () => request("GET", "/api/me"),
				onError: () => {
					toast.error("Erreur lors de la récupération du profil")
				},
			}),
	},
}
