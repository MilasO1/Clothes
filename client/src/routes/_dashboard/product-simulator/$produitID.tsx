import { useState } from "react"

import { createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { imageSrc } from "@/components/productUtils"

import api from "@/contexts/apiQueries.js"
import { FinalizeProductDialog } from "@/features/product-simulation/components/finalize-product-dialog"
import ImpactAnalysisTable from "@/features/product-simulation/components/impact-analysis-table"
import ProductAnalysisTable from "@/features/product-simulation/components/product-analysis-table"
import RecyclabilityAnalysisTable from "@/features/product-simulation/components/recyclability-analysis-table"
import ShowBOM from "@/features/product-analyse/components/show-bom"
import type { Produit } from "@/features/produits/types"

import productValidationIcon from "@/assets/product-validation.svg"
import productValidationClearIcon from "@/assets/product-validation-clear.svg"

export const Route = createFileRoute("/_dashboard/product-simulator/$produitID")({
	component: ProductSimulation,
})

function SimulationItem({ produit, readonly = false, title, Selector }) {
	return (
		<div className="flex flex-col items-center gap-4">
			<h2 className="text-primary text-lg">{title}</h2>

			{Selector}

			<ShowBOM produit={produit} readonly={readonly} />
		</div>
	)
}

function Header({ produit, simulations }) {
	return (
		<div className="sticky top-0 z-1 bg-background2 flex justify-evenly items-center border-b-2 p-3">
			<SimulationItem
				produit={produit}
				readonly={true}
				title="Produit Initial"
				Selector={<h3 className="text-primary text-lg font-semibold capitalize">{produit.nom}</h3>}
			/>

			<img src={imageSrc(produit.type)} alt="illustration produit" className="rounded-lg border max-h-34" />

			<SimulationItem
				produit={produit}
				title="Simulation"
				Selector={
					<select className="text-primary text-lg font-semibold capitalize">
						{simulations.map((simulation, index) => (
							<option key={index} className="bg-background3 p-2">
								{simulation.value}
							</option>
						))}
					</select>
				}
			/>
		</div>
	)
}

function ProductSimulation() {
	const { produitID } = Route.useParams()

	const { data, isLoading, isError } = api.produits.get(produitID)
	const produit = data as Produit

	// Add state for dialog
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	// Add state for simulations
	const [simulations] = useState([
		{ value: "test simulation 1", label: "test simulation 1" },
		{ value: "test simulation 2", label: "test simulation 2" },
	])
	// Add state for selected simulations
	const [selectedSimulations, setSelectedSimulations] = useState([])

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

	return (
		<>
			<Header produit={produit} simulations={simulations} />

			<div className="p-4">
				<ProductAnalysisTable
					ecoLabelInterne={["Non attribué", "Non attribué"]}
					affichageEnvi={[1000, 2000]}
					scorePEF={[800, 1700]}
					labelMatieres={["Aucun label", "Aucun label"]}
					coutRevient={[55, 44]}
					nombreComposants={{
						reference: {
							etoffes: 1,
							accessoires: 0,
							impressions: 0,
							etiquettes: 0,
						},
						simulation: {
							etoffes: 1,
							accessoires: 0,
							impressions: 0,
							etiquettes: 0,
						},
					}}
					scoreMatiere={[50, 60]}
				/>

				<RecyclabilityAnalysisTable
					recyclabilityScore={[70, 90]}
					recycledMaterials={{
						reference: [
							{
								nom: "Polypropylène",
								description: "Composants faits de Polypropylène, Polyester et Coton qui seront recyclés: nom composant",
							},
							{
								nom: "Polyester",
								description: "Composants faits de Polypropylène, Polyester et Coton qui seront recyclés: nom composant",
							},
							{
								nom: "Coton",
								description: "Composants faits de Polypropylène, Polyester et Coton qui seront recyclés: nom composant",
							},
						],
						simulation: [
							{
								nom: "Polypropylène",
								description: "Composants faits de Polypropylène, Polyester et Coton qui seront recyclés: nom composant",
							},
						],
					}}
					nonRecycledComponents={{
						reference: ["etoffe"],
						simulation: [],
					}}
					disassemblySteps={[1, 1]}
				/>

				<div className="mt-8">
					<div className="mb-4 flex items-center gap-2">
						<h2 className="text-secondary text-xl font-medium">Analyse impact des etoffes</h2>
						<div className="bg-secondary h-[1px] flex-grow" />
					</div>
					{/* Replace the grid of ImpactAnalysisCard components with the new table */}
					<ImpactAnalysisTable
						environmentalCost={[100, 65]}
						waterConsumption={[100, 75]}
						microFiberEmission={[70, 100]}
					/>
				</div>

				<div className="bg-accent mx-auto mt-8 max-w-[900px] rounded-md border p-6 shadow-sm">
					<div className="flex flex-col items-center gap-5">
						<p className="text-primary mb-4 font-semibold md:mb-0">
							Vous souhaitez finaliser la conception de votre article et choisir celui qui sera mis en production?
						</p>
						<div className="flex items-center">
							<span className="mr-2 text-gray-600">Cliquez ici</span>
							<ArrowRightIcon className="h-4 w-4" />
							<Button className="group relative ml-2 h-14 text-left" onClick={() => setIsDialogOpen(true)}>
								<img
									src={productValidationIcon}
									alt="illustration produit"
									width={24}
									height={24}
									className="transition-opacity duration-200 group-hover:opacity-0"
								/>
								<img
									src={productValidationClearIcon}
									alt="illustration produit"
									width={24}
									height={24}
									className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
								/>
								Finaliser la <br /> conception
							</Button>
						</div>
					</div>
				</div>

				<FinalizeProductDialog
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
					simulations={simulations}
					selectedSimulations={selectedSimulations}
					setSelectedSimulations={setSelectedSimulations}
				/>
			</div>
		</>
	)
}
