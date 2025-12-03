import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { masseTotale, prettyMass } from "@/features/produits/business"

export const produitsColumns = onDelete => [
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
		accessorKey: "type",
		id: "Type",
		header: () => "Type",
	},
	{
		id: "Masse",
		header: () => "Masse",
		cell: ({ row }) => {
			const mass = masseTotale(row.original)
			return prettyMass(mass).join(" ")
		},
		//accessorFn: row => masseTotale(row.original),
		// sortingFn: (rowA, rowB) => {
		// 	console.log( masseTotale(rowA.original) - masseTotale(rowB.original))
		// 	return 0
		// },
	},
	{
		accessorKey: "recyclabilite",
		//accessorFn: row => row.original.recyclabilite || -1,
		id: "Recyclabilité",
		header: () => "Recyclabilité",
		cell: ({ row }) => {
			const mass = masseTotale(row.original)
			const recyclable = masseTotale(row.original, "recyclMass")

			if (!mass) {
				return "-"
			}

			return ((recyclable / mass) * 100).toFixed(0) + " %"
		},
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
]
