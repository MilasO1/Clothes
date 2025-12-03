import { Card, CardContent } from "@/components/ui/card"

import { imageSrc } from "@/components/productUtils"
import ShowBOM from "@/features/product-analyse/components/show-bom"
import type { Produit } from "@/features/produits/types"

interface ProductCardProps {
	image?: string
	produit: Produit
	updateDate: string
	collection: string
}

export default function ProductCard({ produit, updateDate, collection }: ProductCardProps) {
	return (
		<Card className="card-shape min-w-[400px]">
			<CardContent className="fx-center gap-6 px-0 h-full">
				<img
					src={imageSrc(produit.type)}
					alt="illustration produit"
					className="object-cover h-[180px] rounded-md shadow-sm"
					width={140}
					height={180}
				/>

				<div className="flex flex-1 flex-col gap-4 justify-between h-full">
					<h3 className="text-primary text-2xl font-bold capitalize">{produit.nom}</h3>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col justify-start gap-1">
							<div className="gap-1 text-sm text-muted-foreground">Type de produit</div>
							<div className="capitalize">{produit.type}</div>
						</div>

						<div className="flex flex-col justify-start gap-1">
							<div className="text-sm text-muted-foreground">Mise à jour</div>
							{updateDate}
						</div>

						<div className="col-span-2">
							<div className="text-sm text-muted-foreground">Collection</div>
							{collection}
						</div>
					</div>
					<ShowBOM produit={produit} readonly={true} />
				</div>
			</CardContent>
		</Card>
	)
}
