import type { ColumnDef } from "@tanstack/react-table"
import { Droplets, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Material } from "../types"

export function filterCustom(mat) {
	return mat.matieres || mat.idEcobalyse.startsWith("custom-")
}

export const baseMaterialsColumns: ColumnDef<Material>[] = [
	{
		accessorKey: "nom",
		id: "nom",
		header: () => "Dénomination",
	},
	{
		accessorKey: "typologieFibre",
		id: "Type",
		header: () => "Type",
	},
	{
		accessorKey: "famille",
		id: "Famille",
		header: () => "Famille",
	},
	{
		accessorKey: "consoEau",
		id: "Consommation d'eau",
		header: () => "Consommation d'eau",
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<Droplets className="size-4 text-blue-500" />
				<span className="font-semibold">{row.original.consoEau?.toFixed(0) ?? "0"} </span>
				<span className="text-muted-foreground">Litres</span>
			</div>
		),
	},
	{
		accessorKey: "coutEnv",
		id: "Cout environnemental + Complément microfibres",
		header: () => (
			<div className="text-foreground flex size-full flex-col justify-center p-2">
				<span>Coût environnemental</span>
				<span className="sub-text">(+Complément microfibres)</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex h-full items-center gap-2 pl-4">
				<div className="flex flex-col justify-center">
					<span>{row.original.coutEnv?.toFixed(2) ?? "?"}</span>
					<span className="sub-text">{row.original.complemMicrofibres?.toFixed(0) ?? "?"}</span>
				</div>
				<span className="text-muted-foreground">Pts</span>
			</div>
		),
	},
	{
		accessorKey: "scorePEF",
		id: "Score PEF",
		header: () => "Score PEF",
		cell: ({ row }) => (
			<div className="flex h-full items-center justify-start gap-2">
				<span>{row.original.scorePEF?.toFixed(2) ?? "?"}</span>
				<span className="text-muted-foreground">μPts</span>
			</div>
		),
	},
	{
		accessorKey: "recyclabilite",
		id: "recyclabilite",
		header: () => "Recyclabilité",
		cell: ({ row }) => ((row.original.recyclabilite || 0) * 100).toFixed(0) + " %",
	},
]

export const mixMaterialsColumns = (onDelete: (material: Material) => void): ColumnDef<Material>[] => [
	...baseMaterialsColumns,
	{
		id: "actions",
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
