import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/components/utils"

import BomTable from "@/components/bomTable"
import { produitCreationSchema, type ProduitCreationSchema } from "./schema"

import TypeProduitIcons from "@/assets/typesProduit"

import api from "@/contexts/apiQueries.js"

export default function ProduitCreationForm({ resource, onClose }) {
	const { mutateAsync: create, isPending: isCreatePending } = api.produits.create()
	const { mutateAsync: update, isPending: isUpdatePending } = api.produits.update()

	const composis = resource?.compositions

	const form = useForm<ProduitCreationSchema>({
		resolver: zodResolver(produitCreationSchema),
		defaultValues: {
			nom: resource?.nom ?? "",
			type: resource?.type ?? "",
			compositions: composis ?? [],
		},
		mode: "onChange",
	})
	const composiFields = useFieldArray({
		control: form.control,
		name: "compositions",
	})
	useEffect(() => {
		composiFields.replace(composis)
	}, [composis, composiFields.replace])

	const onSubmit = async prodForm => {
		const body = {
			...prodForm,
			compositions: prodForm.compositions.map(({ composantId, nombre, unite }) => ({
				composantId,
				nombre,
				unite,
			})),
		}

		onClose()
		if (resource) {
			await update({ rscId: resource.id, body })
		} else {
			await create(body)
		}
		form.reset()
	}

	if (Object.entries(form.formState.errors).length) {
		console.log("❌ Invalid", form.formState.errors, JSON.stringify(form.getValues(), null, "\t"))
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 px-6 pb-6">
				<FormField
					control={form.control}
					name="nom"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								Nom du nouveau produit <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Input placeholder="T-shirt en coton brodé" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem className="w-full gap-3">
							<FormLabel>
								Type du produit <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<div className="flex flex-wrap justify-evenly w-full gap-4">
									{Object.entries(TypeProduitIcons).map(([type, Icon]) => (
										<div
											key={type}
											className={cn("fxc-center gap-3 p-3 card-shape activable group group-hover:shadow-xl border-2", {
												"border-primary text-primary font-medium": field.value === type,
												"border-border": field.value !== type,
											})}
											onClick={() => field.onChange(type)}
										>
											<Icon className="group-hover:scale-110" />
											<span className="capitalise group-hover:font-medium">{type}</span>
										</div>
									))}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormItem className="gap-3">
					<FormLabel>
						Composition <span className="text-destructive">*</span>
					</FormLabel>
					<FormControl>
						<BomTable compositions={composiFields.fields} updater={composiFields} />
					</FormControl>
					<FormMessage />
				</FormItem>

				<div className="flex items-center justify-end">
					<Button type="submit" disabled={isCreatePending || isUpdatePending} className="flex gap-2 mt-16">
						{isCreatePending || isUpdatePending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider"}
					</Button>
				</div>
			</form>
		</Form>
	)
}
