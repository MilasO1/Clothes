import { z } from "zod"
import { MatiereSchema } from "@/features/matieres/types"

export const composantTypes = ["accessoire", "etiquette", "etoffe", "impression-broderie"] as const
export const currencies = ["€", "$"] as const
export const massUnits = ["kg", "g"] as const
export const nonMassUnits = ["m²", "cm²", "m-140", "m-135", "yard", "piece"] as const
export const units = [...massUnits, ...nonMassUnits] as const

export type ComposantType = (typeof composantTypes)[number]
export type Currency = (typeof currencies)[number]
export type Unit = (typeof units)[number]

export interface ComposantCreation extends Omit<Composant, "id"> {}
export interface ComposantRetrieval extends Composant {}

export const ComposantSchema = z.object({
	id: z.string(),
	nom: z.string(),
	reference: z.string().optional(),
	matiere: z.string(),
	type: z.enum(composantTypes),
	masseUnitaire: z.number(), // En kg / unité
	unite: z.enum(nonMassUnits),
	prixUnitaire: z.number().optional(),
	monnaie: z.enum(currencies),
})
export type Composant = z.infer<typeof ComposantSchema>

export const ComposantDetailsSchema = ComposantSchema.extend({
	matiereDetails: MatiereSchema.optional(),
})
