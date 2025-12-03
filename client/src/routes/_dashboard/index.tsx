import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { cn } from "@/components/utils"

import ProductCard from "@/features/produits/components/product-card"
import ProductsFilters from "@/features/produits/components/product-filters"
import ProductHorizontalCard from "@/features/produits/components/product-horizontal-card"
import { Separator } from "@/components/ui/separator"
import api from "@/contexts/apiQueries.js"

export const Route = createFileRoute("/_dashboard/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { data: produits } = api.produits.list()

	const [view, setView] = useState<"grid" | "list">("grid")

	return (
		<div className="flex flex-col gap-4 p-6">
			<ProductsFilters view={view} setView={setView} />
			<Separator />
			{produits && (
				<div className={cn("gap-4 flex flex-wrap justify-center", view === "grid" ? "" : "flex-col")}>
					{produits.map(product =>
						view === "grid" ? (
							<ProductCard key={product.id} product={product} />
						) : (
							<ProductHorizontalCard key={product.id} product={product} />
						)
					)}
				</div>
			)}
		</div>
	)
}
