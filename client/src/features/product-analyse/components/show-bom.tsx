import { FileText } from "lucide-react"

import BomTable from "@/components/bomTable"
import type { Produit } from "@/features/produits/types"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

export default function ShowBOM({ produit, readonly = false }: { produit: Produit; readonly?: boolean }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<button className="fx-center gap-2 bg-background3 px-3 py-4 rounded-full border border-muted-foreground/30 font-medium shadow-sm hover:font-semibold">
					<FileText className="size-5" />
					<span className="whitespace-nowrap">Afficher la BOM</span>
				</button>
			</DialogTrigger>
			<DialogContent className="w-10/12 min-h-1/2 max-h-11/12 gap-6 overflow-y-auto scrollbar-hide">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold text-primary">Bill of Material - {produit.nom}</DialogTitle>
					<DialogDescription className="sr-only">BOM</DialogDescription>
				</DialogHeader>

				<BomTable compositions={produit.compositions} readonly={readonly} />
			</DialogContent>
		</Dialog>
	)
}
