import { z } from "zod"
import { ComposantDetailsSchema, units } from "@/features/composants/types"

export const CirculariteSchema = z.object({
	recyclMass: z.number(),
	totalMass: z.number(),
})
export type Circularite = z.infer<typeof CirculariteSchema>

export const CompositionSchema = z.object({
	composantId: z.string(),
	nombre: z.number(),
	unite: z.enum(units),
	compo: ComposantDetailsSchema,
})
export type Composition = z.infer<typeof CompositionSchema>

export const ProduitSchema = z.object({
	id: z.string(),
	nom: z.string(),
	reference: z.string().optional(),
	type: z.string(),

	circularite: z.record(z.string(), CirculariteSchema),
	compositions: z.array(CompositionSchema),

	collection: z.string().optional(),
})

export type Produit = z.infer<typeof ProduitSchema>
export interface Product extends Produit {} // Deprecated, for backward compat, remove

export interface Country {
	code: string
	name: string
}

export interface PureMatiere {
	id: string
	idEcobalyse: string
	nom: string
}

export interface EcobalyseInput {
	matieres: Array<{
		id: string
		country: string
	}>
	procedes: Array<{
		type: string
		country: string
	}>
}

export interface ImpactResult {
	ecs: number
	pef: number
}
