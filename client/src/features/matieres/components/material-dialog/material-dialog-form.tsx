import { X, Plus, Loader2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import {
	MultiSelector,
	MultiSelectorContent,
	MultiSelectorInput,
	MultiSelectorItem,
	MultiSelectorList,
	MultiSelectorTrigger,
} from "@/components/ui/multi-select"
import { rd } from "@/components/utils"
import { materialSchema, type MaterialFormData } from "./schema"
import type { MaterialCreation } from "@/features/matieres/types"
import api from "@/contexts/apiQueries.js"
import { composantTypes } from "@/features/composants/types"

export default function MaterialDialogForm({ material, onClose }) {
	const { data: materials } = api.matieres.list()
	const baseMaterials = materials?.filter(mat => !mat.matieres)

	const { mutate: create, isPending: isCreatePending } = api.matieres.create()
	const { mutate: update, isPending: isUpdatePending } = api.matieres.update()

	const form = useForm<MaterialFormData>({
		resolver: zodResolver(materialSchema),
		defaultValues: {
			nom: material?.nom ?? "",
			matieres: material?.matieres?.map(mat => ({
				id: mat.id,
				rate: mat.rate * 100,
			})) ?? [{ id: "", rate: 0 }],
			typesComposant:
				material?.typesComposant?.map(elem => ({
					label: elem,
					value: elem,
				})) ?? [],
		},
		mode: "onChange",
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "matieres",
	})

	const watchedCompositions = form.watch("matieres")

	const sumRates = watchedCompositions?.reduce((sum, comp) => sum + (comp.rate / 100 || 0), 0)

	const getAvailableMaterials = (currentFieldValue: string) => {
		const allSelectedIds = form.getValues("matieres")?.map(matiere => matiere.id)

		return baseMaterials.filter(material => !allSelectedIds?.includes(material.id) || material.id === currentFieldValue)
	}

	const handleAddComposition = () => {
		if (fields.length < 3) {
			append({ id: "", rate: Math.round(100 * (1 - sumRates)) })
		}
	}

	const handleRemoveComposition = (index: number) => {
		remove(index)
	}

	const onSubmit = (data: MaterialFormData) => {
		const creationData: MaterialCreation = {
			...data,
			typesComposant: data.typesComposant.map(elem => elem.value),
		}

		creationData.matieres = data.matieres?.map(mat => ({
			id: mat.id,
			rate: mat.rate / 100,
		}))

		if (material) {
			update({ rscId: material.id, body: creationData })
		} else {
			create(creationData)
		}
		onClose()
		form.reset()
	}

	// if (Object.entries(form.formState.errors).length) {
	// 	console.log("❌ Invalid", form.formState.errors, JSON.stringify(form.getValues(), null, "\t"))
	// }

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
				<FormField
					control={form.control}
					name="nom"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Nom de la nouvelle matière <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Input placeholder="Coton naturel" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="space-y-4">
					<FormLabel>Composition du mélange</FormLabel>

					{rd(sumRates) !== 1 && (
						<p className="text-destructive text-sm">
							Le taux de présence total des matières doit être égal à 100% (actuellement : {(sumRates * 100).toFixed(0)}
							%)
						</p>
					)}

					<div className="grid grid-cols-3 gap-4">
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="space-y-4 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-gray-300"
							>
								<div className="flex h-4 items-center justify-between">
									<FormLabel className="text-base font-medium">Matière {index + 1}</FormLabel>
									{index > 0 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => handleRemoveComposition(index)}
											className="rounded-full hover:bg-teal-50"
										>
											<X className="size-4" />
										</Button>
									)}
								</div>
								<div className="space-y-4">
									<FormField
										control={form.control}
										name={`matieres.${index}.id`}
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Select value={field.value} onValueChange={field.onChange}>
														<SelectTrigger className="w-full truncate">
															<SelectValue placeholder="Sélectionner une matière" />
														</SelectTrigger>
														<SelectContent>
															{getAvailableMaterials(field.value).map(material => (
																<SelectItem key={material.id} value={material.id}>
																	{material.nom}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`matieres.${index}.rate`}
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm">Taux</FormLabel>
												<FormControl>
													<div className="flex items-center gap-2">
														<Input
															type="number"
															min="0"
															max="100"
															className="text-right"
															{...field}
															onChange={e => field.onChange(Number(e.target.value))}
														/>
														<span className="shrink-0">%</span>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						))}

						{fields.length < 3 && (
							<div className="flex h-full min-h-[200px] items-center">
								<Button type="button" onClick={handleAddComposition}>
									<Plus className="h-5 w-5" />
									<span className="text-sm">Ajouter une matière au mélange</span>
								</Button>
							</div>
						)}
					</div>
				</div>

				<FormField
					control={form.control}
					name="typesComposant"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Type de composant pouvant contenir la matière</FormLabel>
							<FormControl>
								<MultiSelector values={field.value} onValuesChange={field.onChange} loop={false}>
									<MultiSelectorTrigger>
										<MultiSelectorInput placeholder="Choisir les types de composants" />
									</MultiSelectorTrigger>
									<MultiSelectorContent>
										<MultiSelectorList>
											{composantTypes.map(typ => (
												<MultiSelectorItem key={typ} value={typ} label={typ}>
													{typ}
												</MultiSelectorItem>
											))}
										</MultiSelectorList>
									</MultiSelectorContent>
								</MultiSelector>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex items-center justify-end">
					<Button type="submit" disabled={isCreatePending || isUpdatePending} className="flex gap-2 mt-16">
						{isCreatePending || isUpdatePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider"}
					</Button>
				</div>
			</form>
		</Form>
	)
}
