import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { rd } from "@/components/utils"

import TypeComposantIcons from "@/assets/typesComposant"
import { prettyMass } from "@/features/produits/business"

export const composantsColumns = (onDelete, showType = true) =>
	[
		{
			accessorKey: "nom",
			id: "nom",
			header: () => (
				<>
					<div>Dénomination</div>
					<div className="sub-text">(+ref)</div>
				</>
			),
			cell: ({ row }) => (
				<>
					<div>{row.original.nom}</div>
					<div className="sub-text">{row.original.reference}</div>
				</>
			),
		},
		{
			id: "matiere",
			header: () => (
				<>
					<div>Matière</div>
					<div className="sub-text">(+Recyclabilité)</div>
				</>
			),
			cell: ({ row }) => {
				const mat = row.original.matiereDetails
				if (!mat) {
					return "-"
				}
				return (
					<>
						<div>{mat.nom}</div>
						<div className="sub-text">{((mat.recyclabilite || 0) * 100).toFixed(0) + " %"}</div>
					</>
				)
			},
		},
		{
			accessorKey: "type",
			id: "type",
			header: () => "Type",
			cell: ({ row }) => {
				const type = row.original.type
				const Icon = TypeComposantIcons[type]

				return (
					<div className="flex items-center justify-start gap-2">
						{Icon && <Icon className="size-8" />}
						<span className="capitalize">{type}</span>
					</div>
				)
			},
		},
		{
			accessorKey: "masseUnitaire",
			id: "densite",
			header: () => "Densité",
			cell: ({ row }) => {
				const val = row.original.masseUnitaire || 0
				return prettyMass(val).join(" ") + " / " + row.original.unite
			},
		},
		{
			accessorKey: "prixUnitaire",
			id: "prixUnitaire",
			header: () => "Prix unitaire",
			cell: ({ row }) =>
				rd(row.original.prixUnitaire || 0) + " " + (row.original.monnaie || "€") + " / " + row.original.unite,
		},
		{
			id: "delete",
			enableHiding: false,
			cell: ({ row }) => (
				<Button
					variant="ghost"
					size="icon"
					className="hover:bg-gray-300!"
					onClick={event => {
						event.stopPropagation()
						onDelete(row.original)
					}}
				>
					<Trash2 className="text-destructive size-4" />
				</Button>
			),
		},
	].filter(col => (col.id !== "delete" || onDelete) && (col.id !== "type" || showType)) // For readonly
