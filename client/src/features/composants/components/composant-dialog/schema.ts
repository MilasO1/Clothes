import { z } from "zod"
import { currencies, composantTypes } from "@/features/composants/types"

export const addComposantSchema = z.object({
	nom: z.string().min(1, {
		message: "Le nom est requis",
	}),
	type: z.enum(composantTypes, {
		required_error: "Le type est requis",
	}),
	reference: z.string().optional(),
	specificType: z.string().optional(),
	matiere: z.string({ required_error: "La matière est requise" }).uuid(), //id
	masseUnitaire: z.coerce
		.number({
			message: "La masse unitaire est requise",
		})
		.gte(0, {
			message: "La masse unitaire doit être supérieure à 0",
		})
		.lt(10000, {
			message: "La masse unitaire doit être inférieure à 10000",
		}),
	unite: z.string({ required_error: "L'unité est requise" }),
	prixUnitaire: z.coerce
		.number({
			message: "Le prix unitaire est requis",
		})
		.gte(0, {
			message: "Le prix unitaire doit être supérieur à 0",
		})
		.lt(10000, {
			message: "Le prix unitaire doit être inférieur à 10000",
		}),
	monnaie: z.enum(currencies, {
		required_error: "La monnaie est requise",
	}),
})

export const step1Schema = addComposantSchema.pick({
	nom: true,
	type: true,
	reference: true,
	specificType: true,
})

export const step2Schema = addComposantSchema.pick({
	matiere: true,
	masseUnitaire: true,
	unite: true,
	prixUnitaire: true,
	monnaie: true,
})

export type Step1FormData = z.infer<typeof step1Schema>
export type Step2FormData = z.infer<typeof step2Schema>
export type AddComposantFormData = z.infer<typeof addComposantSchema>
