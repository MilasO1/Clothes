import { z } from "zod"
import { composantTypes } from "@/features/composants/types"

// Zod validation schema for materials form
const materialCompositionSchema = z.object({
	id: z.string().min(1, "Veuillez sélectionner une matière"),
	rate: z.number().gt(0, "Le taux de présence doit être supérieur à 0"),
})

export const materialSchema = z
	.object({
		nom: z.string().min(1, "Le nom de la matière est requis"),
		matieres: z.array(materialCompositionSchema).min(1).max(3),
		typesComposant: z.array(z.object({ value: z.enum(composantTypes), label: z.string() })),
	})
	.refine(
		data => {
			const total = data.matieres.reduce((sum, comp) => sum + comp.rate, 0)
			return total === 100
		},
		{
			path: ["matieres"],
		}
	)

export type MaterialFormData = z.infer<typeof materialSchema>
