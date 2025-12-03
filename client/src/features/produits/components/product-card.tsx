import { ChartPie, DraftingCompass } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { collections, imageSrc, randElem, parentProds } from "@/components/productUtils"
import { router } from "@/contexts/queryProvider"

import type { Produit } from "../types"

export function AnalyseButton({ produitID }) {
	return (
		<Button
			variant="outline"
			size="lg"
			className="flex w-full text-start dark:bg-background3 rounded-full text-sm font-normal justify-start gap-4"
			onClick={() => router.navigate({ to: "/product-analyse/" + produitID })}
		>
			<ChartPie className="size-4" />
			<div className="grow">Analyse</div>
		</Button>
	)
}

export function ComparatorButton({ produitID }) {
	return (
		<Button
			variant="outline"
			size="lg"
			className="flex w-full text-start dark:bg-background3 rounded-full text-sm font-normal justify-start gap-4"
			onClick={() => router.navigate({ to: "/product-Comparator/" + produitID })}
		>
			<DraftingCompass className="size-4" />
			<div className="grow">Comparateur</div>
		</Button>
	)
}

export interface ProductCardProps {
	product: Produit
}

export default function ProductCard({ product }: ProductCardProps) {
	const avancement = Math.floor(Math.random() * 101)
	const miseAJour = new Date()
	miseAJour.setDate(miseAJour.getDate() - Math.floor(Math.random() * 200))

	return (
		<Link to={"/product-analyse/" + product.id}>
			<Card className="max-w-[440px] min-w-[390px] hover:shadow-md">
				<CardContent className="p-0">
					<div className="flex flex-col sm:flex-row">
						{/* Product image and parent product section */}
						<div className="flex w-full shrink-0 flex-col sm:w-[140px]">
							<div className="flex h-[180px] items-center justify-center p-4">
								<div className="h-full w-full overflow-hidden rounded-lg shadow-md">
									<img
										src={imageSrc(product.type)}
										alt="illustration produit"
										className="h-full w-full object-cover"
										width={140}
										height={180}
									/>
								</div>
							</div>
							<div className="space-y-1 p-4">
								<p className="text-sm font-medium mb-2">Produit parent</p>
								<Badge variant="outline" className="w-full justify-center py-1 mt-0">
									{randElem(parentProds)}
								</Badge>
							</div>
						</div>

						<div className="flex-1 space-y-4 p-4">
							<div className="space-y-4">
								<div className="flex items-start justify-between gap-2">
									<h3 className="text-primary truncate text-[15px] font-semibold sm:max-w-[180px] capitalize">
										{product.nom}
									</h3>
									<Badge
										variant="secondary"
										className="bg-primary shrink-0 rounded-full px-2 py-0.5 text-[11px] font-normal text-primary-foreground"
									>
										En cours de design
									</Badge>
								</div>

								<div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[13px]">
									<div>
										<p className="text-muted-foreground">Type de produit</p>
										<p className="font-medium">{product.type}</p>
									</div>
									<div>
										<p className="text-muted-foreground">Dernière mise à jour</p>
										<p className="font-medium">{miseAJour.toLocaleDateString()}</p>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<p className="text-sm font-medium">Collection</p>
								<Badge variant="outline">{randElem(collections)}</Badge>
							</div>

							{/* Improved Progress section */}
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium">Progression</span>
									<span className="text-primary font-medium">{avancement}%</span>
								</div>
								<div className="relative h-2 overflow-hidden rounded-full bg-primary/20">
									<div
										className="from-primary to-primary/80 absolute top-0 left-0 h-full rounded-full bg-gradient-to-r"
										style={{
											width: `${avancement}%`,
											boxShadow: "0 0 10px rgba(0, 121, 140, 0.5), 0 0 5px rgba(0, 161, 184, 0.3)",
										}}
									/>
								</div>
								<div className="flex justify-between px-1 text-xs text-muted-foreground">
									<span>Analyse</span>
									<span>Design</span>
									<span>Production</span>
									<span>Livraison</span>
								</div>
							</div>

							<AnalyseButton produitID={product.id} />
							<ComparatorButton produitID={product.id} />
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}
