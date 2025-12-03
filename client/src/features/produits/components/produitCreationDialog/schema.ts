import { z } from "zod"

import { CompositionSchema, ProduitSchema } from "@/features/produits/types"

export const produitCreationSchema = z.object({
	nom: ProduitSchema.shape.nom.min(1, {
		message: "Le nom est requis",
	}),
	reference: ProduitSchema.shape.reference,
	type: ProduitSchema.shape.type.min(1, {
		message: "Le type est requis",
	}),
	compositions: z.array(CompositionSchema).nonempty("Un produit doit contenir au moins un composant"),
})

export type ProduitCreationSchema = z.infer<typeof produitCreationSchema>
