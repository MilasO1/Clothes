import { Flame, Recycle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Product } from "@/features/produits/types"

interface RecyclingInfoProps {
	produit: Product
}

import MaterialComponent from "./material-component"

export default function RecyclingInfo({ produit }: RecyclingInfoProps) {
	return (
		<Card className="card-shape">
			<CardHeader className="pt-0 px-0">
				<CardTitle className="text-primary rounded-md text-xl font-bold">
					Comprendre la recyclabilité de mes matières
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-row px-0">
				<div className="border-border flex min-h-full basis-1/4 flex-col items-center justify-center border-r pr-4">
					<p className="text-muted-foreground text-center">En savoir plus sur la recyclabilité de:</p>
					<Select>
						<SelectTrigger>
							<SelectValue placeholder="Selectionner une matière" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="laine">Laine</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="border-border flex basis-2/6 flex-col items-center justify-center gap-3 border-r px-4">
					<p className="text-muted-foreground text-center text-sm font-semibold">FILIÈRES DE RECYCLAGE POSSIBLES</p>
					<button className="border-border flex w-full max-w-fit min-w-[305px] items-center justify-start gap-2 bg-background3 rounded-sm border px-2 py-4 hover:border-muted-foreground active:border-2 active:font-bold">
						<Recycle className="size-12" />
						Recyclage en boucle fermée
					</button>
					<button className="border-border flex w-full max-w-fit min-w-[305px] items-center justify-start gap-2 bg-background3 rounded-sm border px-2 py-4 hover:border-muted-foreground active:border-2 active:font-bold">
						<Recycle className="size-12" />
						Recyclage en boucle ouverte
					</button>
					<button className="border-border flex w-full max-w-fit min-w-[305px] items-center justify-start gap-2 bg-background3 rounded-sm border px-2 py-4 hover:border-muted-foreground active:border-2 active:font-bold">
						<Flame className="size-12" />
						Valorisation thermique
					</button>
				</div>
				{produit.circularite && (
					<div className="flex-1/3">
						<p className="text-muted-foreground mb-3 text-center text-sm font-semibold">
							PERTURBATEURS AU RECYCLAGE DE LA MATIÈRE
						</p>
						<div className="mb-2 grid w-full grid-cols-[50px_1px_1fr_1px_1fr]">
							<div></div>
							<div></div>
							<div className="pl-3">
								<span className="text-primary text-lg text-nowrap">Nom de l&apos;élément</span>
							</div>
							<div></div>
							<div className="px-4 text-left">
								<span className="text-primary text-lg">Intensité de pertubation</span>
							</div>
						</div>
						<div className="flex flex-col gap-3">
							{Object.entries(produit.circularite).map(([fam, _circu], idx) => (
								<MaterialComponent key={idx} name={fam} intensity={idx % 5} compoType="etoffe" />
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
