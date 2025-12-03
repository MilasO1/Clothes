import type { UseFormReturn } from "react-hook-form"
import type { Step1FormData } from "../schema"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/components/utils"

import TypeComposantIcons from "@/assets/typesComposant"

const componentTypes = {
	etoffe: {
		sousTypes: ["etoffe", "doublure", "empiècement", "isolation", "autre etoffe"],
	},
	accessoire: {
		sousTypes: [
			"bouton",
			"zipper",
			"velcro",
			"pression",
			"boucle",
			"oeillet",
			"mousse",
			"bande élastique",
			"bande antidérapante",
			"autre accessoire",
		],
	},
	etiquette: {
		sousTypes: undefined,
	},
}

interface Step1FormProps {
	form: UseFormReturn<Step1FormData>
}
export default function Step1Form({ form }: Step1FormProps) {
	const sousTypes = componentTypes[form.getValues("type")]?.sousTypes

	return (
		<div className="space-y-6 px-6 h-[65vh]">
			<FormField
				control={form.control}
				name="nom"
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							Nom composant <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<Input placeholder="Nom du composant" {...field} />
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
							Type du composant <span className="text-destructive">*</span>
						</FormLabel>
						<FormControl>
							<div className="flex flex-wrap justify-evenly w-full">
								{Object.entries(TypeComposantIcons).map(([type, Icon]) => (
									<div
										key={type}
										className={cn(
											"fxc-center gap-3 p-3 w-1/5 card-shape activable aspect-square group group-hover:shadow-xl border-2",
											{
												"border-primary text-primary font-medium": field.value === type,
												"border-border": field.value !== type,
											}
										)}
										onClick={() => {
											field.onChange(type)
											form.resetField("specificType")
										}}
									>
										<Icon className="group-hover:scale-105" />
										<span className="capitalise group-hover:font-medium">{type}</span>
									</div>
								))}
							</div>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name="reference"
				render={({ field }) => (
					<FormItem>
						<FormLabel>Référence d'identifiant externe</FormLabel>
						<FormControl>
							<Input placeholder="Référence" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			{sousTypes?.length && (
				<FormField
					control={form.control}
					name="specificType"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Sous-type</FormLabel>
							<FormControl>
								<Select onValueChange={field.onChange} value={field.value || ""}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Sous-type" />
									</SelectTrigger>
									<SelectContent>
										{sousTypes.map(sousType => (
											<SelectItem key={sousType} value={sousType}>
												{sousType}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			)}
		</div>
	)
}
