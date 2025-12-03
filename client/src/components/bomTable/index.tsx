import { Fragment, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import TypeComposantIcons from "@/assets/typesComposant"
import CompoSelector from "@/components/bomTable/compoSelector"
import QuantityField from "@/components/bomTable/quantityField"

import api from "@/contexts/apiQueries.js"
import { type ComposantType, composantTypes } from "@/features/composants/types"
import { compFactor, prettyMass, prettyPrice } from "@/features/produits/business"
import type { Composition } from "@/features/produits/types"

interface ComposiForm extends Composition {
	id?: string
}

export default function BomTable({
	compositions,
	readonly = false,
	updater = { append: console.log, remove: console.log, update: console.log },
}: {
	compositions: ComposiForm[]
	readonly?: boolean
	updater?: { append: any; remove: any; update: any }
}) {
	const { data: allCompos } = api.composantsWithDetails.list()

	const groupedItems = {} as Record<ComposantType, ComposiForm[]>
	for (const type of composantTypes) {
		groupedItems[type] = []
	}

	for (const composi of compositions) {
		if (!composi.compo) {
			// Fallback on the composant list in the flow of the resource table
			composi.compo = allCompos.find(compo => composi.composantId === compo.id)
			if (!composi.compo) {
				continue
			}
		}

		if (composi.compo?.type in groupedItems) {
			groupedItems[composi.compo.type].push(composi)
		} else {
			groupedItems[composi.compo.type] = [composi]
		}
	}

	const [compoTypeSelected, setCompoTypeSelected] = useState("")

	const avlComposToShow = allCompos.filter(
		compo => compo.type === compoTypeSelected && !groupedItems[compoTypeSelected].some(curr => curr.id === compo.id)
	)

	const removeCompo = composantId => {
		updater.remove(compositions.findIndex(item => item.composantId === composantId))
	}

	const handleUpdateComposi = (compoId, newComposi) => {
		const idx = compositions.findIndex(cp => cp.composantId === compoId)
		if (idx !== -1) {
			updater.update(idx, { ...compositions[idx], ...newComposi })
		}
		console.log(idx, compoId, newComposi)
	}

	return (
		<>
			<Table cntClass="bg-background2 overflow-hidden rounded-lg border">
				<TableHeader className="bg-gray-500/15 rounded-lg">
					<TableRow className="[&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-primary *:text-center">
						<TableHead>
							<div>Nom du composant</div>
							<div className="sub-text">(+ref)</div>
						</TableHead>
						<TableHead>
							<div>Matière</div>
							<div className="sub-text">(+recyclabilité)</div>
						</TableHead>
						<TableHead>Quantité</TableHead>
						<TableHead>Masse</TableHead>
						<TableHead>Prix</TableHead>
						{!readonly && <TableHead className="w-12"></TableHead>}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Object.entries(groupedItems).map(([type, composis]) => {
						const Icon = TypeComposantIcons[type]
						const prettyType = type.split("-")[0] + "s"

						return (
							<Fragment key={type}>
								<TableRow className="bg-gray-500/10">
									<TableCell colSpan={2} className="flex gap-4 items-center italic capitalize">
										<Icon className="size-6" />
										{prettyType}
									</TableCell>
									<TableCell className="max-w-1/3"></TableCell>
									<TableCell className="w-52"></TableCell>
									<TableCell></TableCell>
									<TableCell></TableCell>
									{!readonly && (
										<TableCell className="w-12" onClick={() => setCompoTypeSelected(type)}>
											<Plus className="size-8 rounded-full p-1 bg-primary/80 text-primary-foreground" />
										</TableCell>
									)}
								</TableRow>

								{composis.map((composi, idx) => {
									const factor = compFactor(composi)
									return (
										<TableRow key={idx + composi.composantId} className=" outline-muted-foreground/50">
											<TableCell>
												<div>{composi.compo.nom}</div>
												<div className="sub-text">{composi.compo.reference}</div>
											</TableCell>
											<TableCell className="max-w-1/3">
												<div>{composi.compo.matiereDetails?.nom}</div>
												<div className="sub-text">
													{((composi.compo.matiereDetails?.recyclabilite || 0) * 100).toFixed(0) + " %"}
												</div>
											</TableCell>
											<TableCell className="whitespace-nowrap flex w-52">
												<QuantityField composi={composi} onUpdate={handleUpdateComposi} readonly={readonly} />
											</TableCell>
											<TableCell className="text-end">
												{prettyMass(factor * composi.compo.masseUnitaire).join(" ")}
											</TableCell>
											<TableCell className="text-end">
												{prettyPrice(factor, composi.compo.prixUnitaire, composi.compo.monnaie)}
											</TableCell>
											{!readonly && (
												<TableCell className="w-12" onClick={() => removeCompo(composi.composantId)}>
													<Trash2 className="size-8 rounded-full p-1 text-destructive" />
												</TableCell>
											)}
										</TableRow>
									)
								})}
								<tr className="h-4"></tr>
							</Fragment>
						)
					})}
				</TableBody>
			</Table>
			<CompoSelector
				avlCompos={avlComposToShow}
				compoType={compoTypeSelected}
				onClose={() => setCompoTypeSelected("")}
				onSelect={compo => {
					console.log("adding a composi")
					updater.append({
						composantId: compo.id,
						nombre: 0, // Default
						unite: compo.unite, // Default
						compo,
					})
				}}
			/>
		</>
	)
}
