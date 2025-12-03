import { useState } from "react"

import { Settings, Upload } from "lucide-react"
import { toast } from "sonner"

import { FieldMapping } from "@/features/parameters/components/parametre-bom/field-mapping"
import { useBOMUpload } from "@/features/parameters/hooks/use-bom-upload"
import { bomMappingSchema } from "@/features/parameters/schemas"
import { useBOMStore } from "@/features/parameters/stores/bom"
import type { BomMapping } from "@/features/parameters/types"

import { Button } from "@/components/ui/button"

export function BOMConfiguration() {
	const { completedSteps, selectedFile, setSelectedFile, setCompletedSteps, setCurrentStep, setConversionKeyId } =
		useBOMStore()
	const [formState, setFormState] = useState<BomMapping>({
		NomComposant: "",
		TypeComposant: "",
		MatiereComposant: "",
		UniteDeMessure: "",
		PrixUnitaire: "",
		ReferenceComposant: "",
		ReferenceMatiere: "",
		SousTypeComposant: "",
	})
	const [errors, setErrors] = useState<Record<string, boolean>>({})
	const { mutate: uploadBOM } = useBOMUpload()

	const handleFieldChange = (field: keyof BomMapping, value: string) => {
		setFormState(prev => ({
			...prev,
			[field]: value,
		}))
		setErrors(prev => ({
			...prev,
			[field]: false,
		}))
	}

	const handleTestConfiguration = async () => {
		const result = bomMappingSchema.safeParse(formState)

		if (!result.success) {
			const fieldErrors: Record<string, boolean> = {}
			result.error.issues.forEach(issue => {
				if (issue.path[0]) {
					fieldErrors[issue.path[0].toString()] = true
				}
			})
			setErrors(fieldErrors)

			toast.error("Veuillez remplir tous les champs obligatoires")
			return
		}
		setErrors({})
		await uploadBOM(
			{
				file: selectedFile!,
				nom_composant: formState.NomComposant,
				type_composant: formState.TypeComposant,
				matiere: formState.MatiereComposant,
				unite_de_mesure: formState.UniteDeMessure,
				prix_unitaire: formState.PrixUnitaire,
				reference_composant: formState.ReferenceComposant,
				reference_matiere: formState.ReferenceMatiere,
				sous_type_composant: formState.SousTypeComposant,
			},
			{
				onSuccess: (data: string) => {
					toast.message("Configuration validée", {
						description: "Tous les champs requis sont remplis correctement",
					})
					setConversionKeyId(data)
					setCompletedSteps([...new Set([...completedSteps, 2])])
					setSelectedFile(null)
					setCurrentStep(3)
				},
				onError: (error: Error) => {
					console.error(error)
					toast.error("Erreur lors de la conversion")
				},
			}
		)
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h2 className="text-sm font-medium">Bill of Material chargée :</h2>
					<p className="text-muted-foreground text-sm">{selectedFile?.name}</p>
				</div>
				<Button variant="default" className="bg-primary hover:bg-primary/90 gap-2">
					<Upload className="h-4 w-4" />
					Importer BOM
				</Button>
			</div>

			<div className="w-full overflow-hidden">
				<div className="flex w-full items-center gap-4">
					<div className="bg-primary flex-1 rounded-md px-6 py-2 text-center text-white">
						<span className="text-sm font-medium">BILL OF MATERIAL DARWIE</span>
					</div>
					<div className="h-[1px] w-8 flex-shrink-0 bg-transparent" />
					<div className="flex-1 rounded-md bg-gray-600 px-6 py-2 text-center text-white">
						<span className="text-sm font-medium">BILL OF MATERIAL ENTREPRISE</span>
					</div>
				</div>
			</div>

			<div className="space-y-8">
				<div>
					<h3 className="mb-2 text-base font-medium">
						Champs principaux{" "}
						<span className="text-sm font-normal text-gray-500">- important d&apos;être renseignés</span>
					</h3>
					<div className="mt-6 space-y-6">
						<FieldMapping
							value="NomComposant"
							helpText="Le nom du composant dans votre BOM"
							error={errors.NomComposant}
							onChange={value => handleFieldChange("NomComposant", value)}
							inputValue={formState.NomComposant}
						/>
						<FieldMapping
							value="Type composant"
							helpText="Le type de composant (ex: résistance, condensateur)"
							error={errors.TypeComposant}
							onChange={value => handleFieldChange("TypeComposant", value)}
							inputValue={formState.TypeComposant}
						/>
						<FieldMapping
							value="MatièreComposant"
							helpText="La matière principale du composant"
							error={errors.MatiereComposant}
							onChange={value => handleFieldChange("MatiereComposant", value)}
							inputValue={formState.MatiereComposant}
						/>
						<FieldMapping
							value="Unité de mesure (UoM)"
							helpText="L'unité de mesure utilisée (ex: pièces, kg)"
							error={errors.UniteDeMessure}
							onChange={value => handleFieldChange("UniteDeMessure", value)}
							inputValue={formState.UniteDeMessure}
						/>
						<FieldMapping
							value="Prix Unitaire"
							helpText="Le prix par unité du composant"
							error={errors.PrixUnitaire}
							onChange={value => handleFieldChange("PrixUnitaire", value)}
							inputValue={formState.PrixUnitaire}
						/>
					</div>
				</div>

				<div>
					<h3 className="mb-2 text-base font-medium">
						Champs secondaires <span className="text-sm font-normal text-gray-500">- non obligatoires</span>
					</h3>
					<div className="mt-6 space-y-6">
						<FieldMapping
							value="RéférenceComposant"
							helpText="La référence unique du composant"
							onChange={value => handleFieldChange("ReferenceComposant", value)}
							inputValue={formState.ReferenceComposant || ""}
						/>
						<FieldMapping
							value="RéférenceMatière"
							helpText="La référence de la matière utilisée"
							onChange={value => handleFieldChange("ReferenceMatiere", value)}
							inputValue={formState.ReferenceMatiere || ""}
						/>
						<FieldMapping
							value="SousTypeComposant"
							helpText="Une classification plus détaillée du composant"
							onChange={value => handleFieldChange("SousTypeComposant", value)}
							inputValue={formState.SousTypeComposant || ""}
						/>
					</div>
				</div>
			</div>

			<div className="border-t pt-6">
				<div className="flex items-center justify-between">
					<p className="max-w-[280px] text-sm text-gray-500">
						Avant de créer la clef de conversion, vous devez tester le paramétrage pour vous assurer que la clef
						fonctionnera
					</p>
					<Button onClick={handleTestConfiguration}>
						<Settings className="h-4 w-4" />
						Tester le paramétrage
					</Button>
				</div>
			</div>
		</div>
	)
}
