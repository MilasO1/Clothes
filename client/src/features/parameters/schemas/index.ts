import * as z from "zod"

export const bomMappingSchema = z.object({
	NomComposant: z.string().min(1, "Ce champ est requis"),
	TypeComposant: z.string().min(1, "Ce champ est requis"),
	MatiereComposant: z.string().min(1, "Ce champ est requis"),
	UniteDeMessure: z.string().min(1, "Ce champ est requis"),
	PrixUnitaire: z.string().min(1, "Ce champ est requis"),
	ReferenceComposant: z.string().optional(),
	ReferenceMatiere: z.string().optional(),
	SousTypeComposant: z.string().optional(),
})
