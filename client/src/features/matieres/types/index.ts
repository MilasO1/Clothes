import { z } from "zod"
import type { ComposantType } from "@/features/composants/types"

export const familleMatiereList = ["coton", "elasthane", "laine", "metal", "plastique", "polyester", "soie"] as const

export type FamilleMatiere = (typeof familleMatiereList)[number]

export const typeMatiereList = ["artificielle", "mix", "naturelle", "synthetique"] as const

export type TypeMatiere = (typeof typeMatiereList)[number]

export interface SubMaterDB {
	id: string
	rate: number
}

export type Conflicts = Record<"composants" | "produits" | "matieres", string[]>

export interface MaterialRetrieval extends Matiere {}
export interface MaterialCreation extends Omit<Matiere, "id"> {}
export interface MaterialUpdate extends Omit<Matiere, "id"> {}

export interface Material extends Matiere {} // Deprecated, for backward compat, remove

export interface Matiere {
	id: string
	reference?: string
	nom: string
	famille?: FamilleMatiere
	consoEau?: number
	coutEnv?: number
	complemMicrofibres?: number
	scorePEF?: number
	label?: string
	recyclee?: boolean
	typesComposant?: ComposantType[]
	matieres?: SubMaterDB[]
	recyclabilite?: number
	typologieFibre?: TypeMatiere
}
export const MatiereSchema = z.object({
	id: z.string(),
	nom: z.string(),
	reference: z.string().optional(),
	consoEau: z.number().optional(),
	coutEnv: z.number().optional(),
	recyclabilite: z.number().optional(),
	scorePEF: z.number().optional(),
})
//export type Matiere = z.infer<typeof MatiereSchema>
