import { useMutation } from "@tanstack/react-query"

interface BOMUploadParams {
	file: File
	nom_composant: string
	type_composant: string
	matiere: string
	unite_de_mesure: string
	prix_unitaire: string
	reference_composant?: string
	reference_matiere?: string
	sous_type_composant?: string
}

export const useBOMUpload = () => {
	return useMutation({
		mutationFn: async (params: BOMUploadParams) => {
			const formData = new FormData()
			formData.append("file", params.file)
			formData.append("nom_composant", params.nom_composant)
			formData.append("type_composant", params.type_composant)
			formData.append("matiere", params.matiere)
			formData.append("unite_de_mesure", params.unite_de_mesure)
			formData.append("prix_unitaire", params.prix_unitaire)

			if (params.reference_composant) {
				formData.append("reference_composant", params.reference_composant)
			}
			if (params.reference_matiere) {
				formData.append("reference_matiere", params.reference_matiere)
			}
			if (params.sous_type_composant) {
				formData.append("sous_type_composant", params.sous_type_composant)
			}

			const response = await fetch("./api/conversion-keys", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.json()
			return data
		},
	})
}
