import { CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { collections, imageSrc, randElem } from "@/components/productUtils"

import { type ProductCardProps, AnalyseButton, ComparatorButton } from "./product-card"

export default function ProductHorizontalCard({ product }: ProductCardProps) {
	const avancement = Math.floor(Math.random() * 101)
	const miseAJour = new Date()
	miseAJour.setDate(miseAJour.getDate() - Math.floor(Math.random() * 200))

	return (
		<Card className="flex-row p-6 gap-8 items-center">
			<img
				src={imageSrc(product.type)}
				alt="illustration produit"
				className="aspect-square size-20 shrink-0 overflow-hidden rounded-lg shadow-md"
				width={80}
				height={80}
			/>

			<div className="flex flex-col items-start gap-1 mr-auto">
				<h2 className="text-primary line-clamp-2 text-2xl font-bold capitalize">{product.nom}</h2>
				<div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground sm:justify-start">
					<span className="flex items-center gap-1 font-medium whitespace-nowrap text-emerald-600">
						<CheckCircle className="h-4 w-4 shrink-0" />
						Validé
					</span>
					<span className="whitespace-nowrap">{randElem(collections)}</span>
				</div>
			</div>
			<div className="flex flex-col items-start mr-4">
				<span className="text-xs font-medium text-muted-foreground">Dernière mise à jour</span>
				<span className="text-primary text-sm font-semibold">{miseAJour.toLocaleDateString()}</span>
			</div>
			<div className="flex flex-col items-start mr-4">
				<span className="text-xs font-medium text-muted-foreground">Progression</span>
				<div className="flex items-center gap-2">
					<div className="bg-primary/20 h-2 w-16 overflow-hidden rounded-full sm:w-24">
						<div
							className="bg-primary h-full w-full rounded-full transition-all duration-500 ease-in-out"
							style={{
								width: `${avancement}%`,
							}}
						/>
					</div>
					<span className="text-primary text-sm font-semibold">{avancement}%</span>
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<AnalyseButton produitID={product.id} />
				<ComparatorButton produitID={product.id} />
			</div>
		</Card>
	)
}
