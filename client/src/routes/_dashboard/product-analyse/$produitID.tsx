import { createFileRoute } from "@tanstack/react-router"

import api from "@/contexts/apiQueries.js"
import AddLabelCard from "@/features/product-analyse/components/add-label-card"
import CardWithDetails from "@/features/product-analyse/components/card-with-details"
import EcoImpactCard from "@/features/product-analyse/components/eco-impact-card"
import EnvironmentalCostAnalysis from "@/features/product-analyse/components/environmental-cost-analysis"
import EcoModal from "@/features/product-analyse/components/label-eco-conception-interne"
import MaterialDistributionChart from "@/features/product-analyse/components/material-distribution-chart"
import ProductCard from "@/features/product-analyse/components/product-card"
import PieChartCard from "@/features/product-analyse/components/recyclability-card"
import RecyclabilityComponent from "@/features/product-analyse/components/recyclability-component"
import RecycledMaterialsDistribution from "@/features/product-analyse/components/recycled-materials-distribution"
import RecyclingInfo from "@/features/product-analyse/components/recycling-info"
import RepartitionComposants from "@/features/product-analyse/components/repartition-composants"
import SustainabilityGrid from "@/features/product-analyse/components/sustainability-grid"
import { filteredMass, masseTotale, predicates } from "@/features/produits/business"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { compFactor } from "@/features/produits/business"
import type { Produit } from "@/features/produits/types"
import { type ComposantType, composantTypes } from "@/features/composants/types"

// Same as Grafana, good contrast between 2 consecutive
const circuColors = ["#b876d9", "#77be69", "#fade2b", "#f24865", "#5694f2", "#ff9830"]

export const Route = createFileRoute("/_dashboard/product-analyse/$produitID")({
	component: ProductAnalysePage,
})

function ProductAnalysePage() {
	const { produitID } = Route.useParams()

	const { data, isLoading, isError } = api.produits.get(produitID)
	const produit = data as Produit

	if (isLoading) {
		return null // We will put a skeleton later
	}
	if (isError || !produit) {
		return (
			<h2 className="text-center leading-10 p-8 mt-10">
				Erreur de récupération du produit,
				<br />
				ID: <span className="font-semibold inline-block">{produitID}</span>
			</h2>
		)
	}
	if (!produit.compositions.length) {
		return (
			<h2 className="text-center leading-10 p-8 mt-10">
				Produit sans composants,
				<br />
				ID: <span className="font-semibold inline-block">{produitID}</span>
			</h2>
		)
	}

	const totalMass = masseTotale(produit, "totalMass")
	const recyclMass = masseTotale(produit, "recyclMass")

	const responsableMass = filteredMass(produit, predicates.responsable)

	const currency = produit.compositions[0].compo.monnaie

	let sumPrices = 0
	let sumConsoEau = 0
	let compoPrincipal = { item: produit.compositions[0], mass: 0 }

	const compoTypeCounts = Object.fromEntries(composantTypes.map(ct => [ct, 0])) as Record<ComposantType, number>

	for (const composi of produit.compositions) {
		const factor = compFactor(composi)
		const composiMass = composi.compo.masseUnitaire * factor

		sumConsoEau += (composi.compo.matiereDetails?.consoEau || 0) * composiMass
		sumPrices += (composi.compo.prixUnitaire || 0) * factor
		compoTypeCounts[composi.compo.type]++
		if (composiMass > compoPrincipal.mass) {
			compoPrincipal = { item: composi, mass: composiMass }
		}
	}

	//, isError, refetch
	return (
		<div className="container space-y-5 p-4">
			<div className="flex flex-wrap gap-4">
				<ProductCard produit={produit} updateDate="23/10/2024" collection="Été 2026" />
				<MaterialDistributionChart
					title="Répartition des matières"
					data={Object.entries(produit.circularite).map(([fam, circu], idx) => ({
						name: fam,
						value: circu.totalMass,
						color: circuColors[idx % circuColors.length],
					}))}
				/>
				{(sumPrices && currency && (
					<CardWithDetails title="Coût de revient matière">
						<CardWithDetails.Content>
							<span className="text-primary text-5xl font-bold">
								{Math.round(sumPrices)} {currency}
							</span>
							<p className="text-muted-foreground text-center">
								Estimé en fonction des matières présentes dans la BOM du produit.
							</p>
						</CardWithDetails.Content>
						<CardWithDetails.DetailContent>
							<p>Compte des postes de dépenses suivant :</p>
							<p className="text-muted-foreground">- Main d&apos;œuvre </p>
							<p className="text-muted-foreground">- Transport </p>
						</CardWithDetails.DetailContent>
					</CardWithDetails>
				)) ||
					null}
				<Card className="card-shape">
					<CardHeader className="p-0">
						<CardTitle>
							<h2 className="text-primary text-xl font-bold">Évaluations et certificats produits </h2>
						</CardTitle>
					</CardHeader>

					<CardContent className="flex gap-2 px-0">
						<EcoModal />
						<EnvironmentalCostAnalysis produit={produit} />
						<AddLabelCard />
					</CardContent>
				</Card>

				<RepartitionComposants repartition={compoTypeCounts} />

				<PieChartCard title="Recyclabilité en boucle fermée" percentage={(100 * recyclMass) / totalMass}>
					<p className="text-muted-foreground mb-4 text-base">
						Définit le taux de matière théorique qui serait recyclé en boucle fermée. Ce taux prend en compte:
					</p>

					<ul className="space-y-2">
						<li className="flex text-base">
							<span className="text-muted-foreground">- La complexité du produit</span>
						</li>
						<li className="flex text-base">
							<span className="text-muted-foreground">- La recyclabilité des matières</span>
						</li>
						<li className="flex text-base">
							<span className="text-muted-foreground">- Les exigences et contraintes des filières de recyclage</span>
						</li>
					</ul>
				</PieChartCard>
				<CardWithDetails title="Consommation d'eau" withDetail={false}>
					<CardWithDetails.Content>
						<div className="fxc-center gap-4">
							<span className="text-primary mb-2 text-center text-3xl font-bold">
								{Math.round(sumConsoEau).toLocaleString("fr-FR")}
								<br />
								Litres
							</span>
							<div className="bg-primary rounded-md px-4 py-1 text-center text-primary-foreground">Bonne</div>
						</div>
					</CardWithDetails.Content>
				</CardWithDetails>
				<PieChartCard title="Score matière responsable" percentage={(100 * responsableMass) / totalMass}>
					<p className="text-muted-foreground mb-2 text-base">
						Le score matière responsable évalue les matières présentes dans le produit.
					</p>
					<p className="text-muted-foreground mb-2 text-base">
						<strong>Condition pour qu&apos;une matière soit qualifiée de responsable:</strong>
					</p>
					<ul>
						<li className="text-muted-foreground mb-2 text-base">Soit elle intègre de la matière recyclée</li>
						<li className="text-muted-foreground mb-4 text-base">Soit elle est d&apos;origine naturelle</li>
					</ul>
				</PieChartCard>
				{/*
				<CardWithDetails title="Matières principales">
					<CardWithDetails.Content>
						<div className="border-muted w-full rounded-full border py-1 text-center">
							Laine
						</div>
					</CardWithDetails.Content>
				</CardWithDetails>
				*/}
				<SustainabilityGrid />
			</div>
			<div className="mb-2 flex items-center gap-2">
				<h2 className="text-primary text-xl font-bold text-nowrap">Analyse des impacts associés aux matières</h2>
				<div className="bg-primary h-px w-full" />
			</div>
			{compoPrincipal.item.compo.matiereDetails && <EcoImpactCard matiere={compoPrincipal.item.compo.matiereDetails} />}
			<div className="mb-2 flex items-center gap-2">
				<h2 className="text-primary text-xl font-bold text-nowrap">ANALYSE DE LA RECYCLABILITÉ</h2>
				<div className="bg-primary h-px w-full" />
			</div>
			<RecyclabilityComponent />
			<RecycledMaterialsDistribution />
			<div className="flex flex-wrap gap-4">
				<CardWithDetails title="Matières ciblées pour être recyclées">
					<CardWithDetails.Content>
						<div className="border-primary text-primary w-full rounded-full border py-1 text-center">Laine</div>
					</CardWithDetails.Content>
					<CardWithDetails.DetailContent>
						<p className="text-muted">
							Dans un process industriel de recyclage, toutes les matières ne seront pas recyclés. Seules seront
							recyclées:
						</p>
						<ul>
							<li>
								<span className="text-muted">
									celles présentent en suffisamment grande quantité pour pour alimenter une filière de recyclage
								</span>
							</li>
							<li>
								<span className="text-muted">
									{" "}
									-celles avec une valeur économique importante et qui sont faciles à isoler
								</span>
							</li>
						</ul>
					</CardWithDetails.DetailContent>
				</CardWithDetails>

				<CardWithDetails className="min-h-[300px]" title="Composants non recyclés" withDetail={false}>
					<CardWithDetails.Content>
						<div className="border-destructive text-destructive w-full rounded-full border py-1 text-center">Laine</div>
					</CardWithDetails.Content>
				</CardWithDetails>
				<CardWithDetails title="Nombre d'étapes au démantèlement minimum" withDetail={false}>
					<CardWithDetails.Content>
						<span className="text-primary text-5xl font-bold">1</span>
					</CardWithDetails.Content>
				</CardWithDetails>
			</div>
			<RecyclingInfo produit={produit} />
		</div>
	)
}
