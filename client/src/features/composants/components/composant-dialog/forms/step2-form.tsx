import { useState } from "react"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Step2FormData } from "../schema"
import type { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import api from "@/contexts/apiQueries.js"
import MaterialDialog from "@/features/matieres/components/material-dialog"
import { currencies, nonMassUnits } from "@/features/composants/types"

interface Step2FormProps {
	form: UseFormReturn<Step2FormData>
}

// const colorUnite = "blue-500"
// const colorMonnaie = "green-500"
// const colorMasse = "purple-600"

export function Step2Form({ form }: Step2FormProps) {
	const { data: materials } = api.matieres.list()

	const [isOpen, setIsOpen] = useState(false)

	const monnaie = form.watch("monnaie")
	const unite = form.watch("unite")

	return (
		<>
			<div className="grid grid-cols-3 items-center gap-4 px-6 h-[65vh]">
				<FormField
					control={form.control}
					name="matiere"
					render={({ field }) => (
						<FormItem className="col-span-2">
							<FormLabel>
								Choix de la matière <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Sélectionner une matière" />
									</SelectTrigger>
									<SelectContent>
										{materials?.map(material => (
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

				<Button variant="link" size="sm" onClick={() => setIsOpen(true)}>
					<Plus className="mr-1 size-4" />
					Créer une nouvelle matière
				</Button>

				<FormField
					control={form.control}
					name="unite"
					render={({ field }) => (
						<FormItem className="col-span-1">
							<FormLabel>
								Unité de mesure <span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Sélectionner une unité" />
									</SelectTrigger>
									<SelectContent>
										{nonMassUnits.map(unit => (
											<SelectItem key={unit} value={unit}>
												{unit}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div></div>
				<div></div>

				<FormField
					control={form.control}
					name="masseUnitaire"
					render={({ field }) => (
						<FormItem className="col-span-1">
							<FormLabel>
								Masse (kg / {unite})<span className="text-destructive">*</span>
							</FormLabel>
							<FormControl>
								<Input type="number" min={0} {...field} placeholder="Masse unitaire" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col gap-2 col-span-1">
					<FormLabel htmlFor="inputPrix">
						Prix ({monnaie} / {unite})
					</FormLabel>
					<div className="flex w-full gap-2">
						<FormField
							control={form.control}
							name="prixUnitaire"
							render={({ field }) => (
								<FormItem className="w-1/2">
									<FormControl>
										<Input id="inputPrix" type="number" min={0} {...field} placeholder="Prix unitaire" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="monnaie"
							render={({ field }) => (
								<FormItem className="w-1/2">
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="€" />
											</SelectTrigger>
											<SelectContent>
												{currencies.map(monnaie => (
													<SelectItem key={monnaie} value={monnaie}>
														{monnaie}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>

				<p className="text-accent-foreground col-span-2 text-sm italic">
					<span className="font-medium underline">Important:</span> le prix unitaire correspondra à l&apos;unité de
					mesure entrée ci dessus pour permettre une estimation cohérente du coup de revient du produit
				</p>
			</div>
			<MaterialDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
