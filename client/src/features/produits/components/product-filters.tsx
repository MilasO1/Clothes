import { useState } from "react"
import { Grid2X2, Menu } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import ProduitCreationDialog from "@/features/produits/components/produitCreationDialog"

import FilterButton from "./filter-button"

export default function ProductsFilters({ view, setView }) {
	const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false)

	return (
		<div className="w-full space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex gap-4">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<h1 className="text-2xl font-semibold">Collection</h1>
							<Badge
								variant="secondary"
								className="rounded-full border border-gray-500/15 bg-background2 p-2 text-primary text-md"
							>
								Été 2026
							</Badge>
						</div>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<h2 className="text-2xl font-semibold">Saison</h2>
							<Badge
								variant="secondary"
								className="rounded-full border border-gray-500/15 bg-background2 p-2 text-primary text-md"
							>
								2026
							</Badge>
						</div>
					</div>
				</div>
			</div>

			{/* Filters Section */}
			<div className="flex w-full justify-between">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<FilterButton />
				</div>
				<div className="flex items-center gap-2">
					<Button variant="default" onClick={() => setIsCreationDialogOpen(true)}>
						Créer un produit
					</Button>
					<ProduitCreationDialog
						isOpen={isCreationDialogOpen}
						onClose={() => setIsCreationDialogOpen(false)}
						resource={null}
					/>

					<Button
						variant="ghost"
						size="icon"
						onClick={() => setView("grid")}
						className={view === "grid" ? "text-primary" : ""}
					>
						<Grid2X2 className="h-5 w-5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setView("list")}
						className={view === "list" ? "text-primary" : ""}
					>
						<Menu className="h-5 w-5" />
					</Button>
				</div>
			</div>
		</div>
	)
}
