import { useState } from "react"

import { ArrowLeft, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
	MultiSelector,
	MultiSelectorContent,
	MultiSelectorInput,
	MultiSelectorItem,
	MultiSelectorList,
	MultiSelectorTrigger,
} from "@/components/ui/multi-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import sampleImage from "@/assets/produit-tshirt.webp"

interface FinalizeProductDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	simulations
	selectedSimulations
	setSelectedSimulations: (simulations) => void
}

export function FinalizeProductDialog({
	open,
	onOpenChange,
	simulations,
	selectedSimulations,
	setSelectedSimulations,
}: FinalizeProductDialogProps) {
	const [selectedProduct, setSelectedProduct] = useState<"initial" | "simulation" | null>(null)
	const [step, setStep] = useState<"selection" | "confirmation" | "drafts" | "final">("selection")
	const [createDrafts, setCreateDrafts] = useState<boolean>(true)
	const [loading, setLoading] = useState(false)
	const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null)

	const handleConfirm = () => {
		if (step === "selection") {
			setStep("confirmation")
		} else if (step === "confirmation") {
			if (createDrafts) {
				setStep("drafts")
			} else {
				setStep("final")
			}
		} else if (step === "drafts") {
			setStep("final")
		} else {
			// Final confirmation logic here
			console.log("Selected product:", selectedProduct)
			console.log("Create drafts:", createDrafts)
			console.log("Selected simulations for drafts:", selectedSimulations)
			onOpenChange(false)
			resetState()
		}
	}

	const handleBack = () => {
		if (step === "final") {
			setStep(createDrafts ? "drafts" : "confirmation")
		} else if (step === "drafts") {
			setStep("confirmation")
		} else if (step === "confirmation") {
			setStep("selection")
		}
	}

	const handleClose = () => {
		onOpenChange(false)
		resetState()
	}

	const resetState = () => {
		setStep("selection")
		setSelectedProduct(null)
		setCreateDrafts(true)
		setSelectedSimulations([])
		setSelectedSimulation(null)
	}

	const handleFinalize = async () => {
		setLoading(true)
		// Simulate API call lag
		await new Promise(resolve => setTimeout(resolve, 1000))
		setLoading(false)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-[800px]">
				<DialogHeader>
					<DialogTitle className="text-primary text-xl font-semibold">
						FINALISER LA CONCEPTION DU PRODUIT {selectedProduct === "initial" ? "NOM PRODUIT" : "TEST PRODUIT"}
					</DialogTitle>
					<DialogDescription>
						Sélectionnez les simulations que vous souhaitez finaliser pour la production.
					</DialogDescription>
				</DialogHeader>

				{step === "selection" ? (
					<div className="py-6">
						<div className="flex flex-col gap-6">
							<h3 className="text-primary mb-4 text-center font-medium">
								Veuillez sélectionner le produit que vous souhaitez mettre en production
							</h3>

							{/* Products in a grid layout with responsive behavior */}
							<div className="grid max-h-[400px] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 md:grid-cols-3">
								{/* Initial Product Card */}
								<button
									onClick={() => setSelectedProduct("initial")}
									className={`relative flex flex-col items-center rounded-md border p-4 transition-all ${
										selectedProduct === "initial"
											? "border-primary ring-primary/20 ring-2"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									<div className="mb-4 rounded-md border p-4">
										<img src={sampleImage} alt="Product" width={100} height={100} />
									</div>
									<p className="text-secondary mb-2">nom produit</p>
									<div className="bg-secondary rounded-full px-3 py-1 text-sm text-white">Produit initial</div>

									{selectedProduct === "initial" && (
										<div className="bg-primary absolute top-2 right-2 rounded-full p-1 text-white">
											<Check className="h-4 w-4" />
										</div>
									)}
								</button>

								{/* Simulation Products */}
								{simulations.map(simulation => (
									<button
										type="button"
										key={simulation}
										onClick={() => {
											setSelectedProduct("simulation")
											setSelectedSimulation(simulation)
										}}
										className={`relative flex flex-col items-center rounded-md border p-4 transition-all ${
											selectedProduct === "simulation" && selectedSimulation === simulation
												? "border-primary ring-primary/20 ring-2"
												: "border-gray-200 hover:border-gray-300"
										}`}
									>
										<div className="mb-4 rounded-md border p-4">
											<img src={sampleImage} alt="Product" width={100} height={100} />
										</div>
										<p className="mb-2 text-gray-700">{simulation}</p>
										<div className="rounded-full bg-black px-3 py-1 text-sm text-white">Simulation</div>

										{selectedProduct === "simulation" && selectedSimulation === simulation && (
											<div className="bg-primary absolute top-2 right-2 rounded-full p-1 text-white">
												<Check className="h-4 w-4" />
											</div>
										)}
									</button>
								))}
							</div>
						</div>
					</div>
				) : step === "confirmation" ? (
					<div className="py-6">
						<div className="mb-6 rounded-lg bg-gray-50 p-6">
							<h3 className="text-primary mb-4 font-medium">PRODUIT RETENU POUR ÊTRE MIS EN PRODUCTION</h3>

							<div className="flex items-center gap-6">
								<div className="rounded-md border bg-white p-4">
									<img src={sampleImage} alt="Product" width={80} height={80} />
								</div>
								<div>
									<p className="mb-1 text-gray-700">
										{selectedProduct === "initial" ? "nom produit" : selectedSimulation}
									</p>
									<div
										className={`${selectedProduct === "initial" ? "bg-secondary" : "bg-black"} inline-block rounded-full px-3 py-1 text-sm text-white`}
									>
										{selectedProduct === "initial" ? "Produit initial" : "Simulation"}
									</div>
								</div>
							</div>
						</div>

						<p className="mb-6 text-sm text-gray-700">
							Toutes les simulations non retenues ou non sauvegardées comme brouillon seront supprimées.
						</p>

						<div className="rounded-lg border p-6">
							<h3 className="text-primary mb-4 text-center font-medium">
								Voulez vous créer des brouillons à partir des simulations ?
							</h3>
							<p className="mb-6 text-center text-sm text-gray-700">
								Les simulations non sélectionnées pour devenir des brouillons seront supprimées
							</p>

							<RadioGroup
								defaultValue={createDrafts ? "oui" : "non"}
								className="mb-6 flex justify-center gap-8"
								onValueChange={value => setCreateDrafts(value === "oui")}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="oui" id="oui" />
									<Label htmlFor="oui">Oui</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="non" id="non" />
									<Label htmlFor="non">Non</Label>
								</div>
							</RadioGroup>
						</div>
					</div>
				) : step === "drafts" ? (
					<div className="py-6">
						<div className="mb-6 rounded-lg bg-gray-50 p-6">
							<h3 className="text-primary mb-4 font-medium">PRODUIT RETENU POUR ÊTRE MIS EN PRODUCTION</h3>

							<div className="flex items-center gap-6">
								<div className="rounded-md border bg-white p-4">
									<img src={sampleImage} alt="Product" width={80} height={80} />
								</div>
								<div>
									<p className="mb-1 text-gray-700">
										{selectedProduct === "initial" ? "nom produit" : selectedSimulation}
									</p>
									<div
										className={`${selectedProduct === "initial" ? "bg-secondary" : "bg-black"} inline-block rounded-full px-3 py-1 text-sm text-white`}
									>
										{selectedProduct === "initial" ? "Produit initial" : "Simulation"}
									</div>
								</div>
							</div>
						</div>

						<div className="rounded-lg border p-6">
							<h3 className="text-primary mb-4 text-center font-medium">
								Veuillez sélectionner le(s) simulation(s) que vous souhaitez sauvegarder comme brouillon?
							</h3>

							<div className="mb-4">
								<MultiSelector values={selectedSimulations} onValuesChange={setSelectedSimulations} className="w-full">
									<MultiSelectorTrigger className="w-full">
										<MultiSelectorInput placeholder="Sélectionnez des simulations..." />
									</MultiSelectorTrigger>
									<MultiSelectorContent>
										<MultiSelectorList>
											{/* Filter out the selected product from the options */}
											{simulations
												.filter(
													simulation =>
														selectedProduct === "initial" ||
														(selectedProduct === "simulation" && simulation !== selectedSimulation)
												)
												.concat(selectedProduct === "simulation" ? ["nom produit"] : [])
												.map(option => (
													<MultiSelectorItem key={option} value={option} label={option}>
														{option}
													</MultiSelectorItem>
												))}
										</MultiSelectorList>
									</MultiSelectorContent>
								</MultiSelector>
							</div>
						</div>
					</div>
				) : (
					<div className="py-6">
						<div className="mb-6 rounded-lg bg-gray-50 p-6">
							<h3 className="text-primary mb-4 font-medium">PRODUIT RETENU POUR ÊTRE MIS EN PRODUCTION</h3>

							<div className="flex items-center gap-6">
								<div className="rounded-md border bg-white p-4">
									<img src={sampleImage} alt="Product" width={80} height={80} />
								</div>
								<div>
									<p className="mb-1 text-gray-700">
										{selectedProduct === "initial" ? "nom produit" : selectedSimulation}
									</p>
									<div
										className={`${selectedProduct === "initial" ? "bg-secondary" : "bg-black"} inline-block rounded-full px-3 py-1 text-sm text-white`}
									>
										{selectedProduct === "initial" ? "Produit initial" : "Simulation"}
									</div>
								</div>
							</div>
						</div>

						{createDrafts && selectedSimulations.length > 0 && (
							<div className="mb-6 rounded-lg bg-gray-50 p-6">
								<h3 className="text-primary mb-4 font-medium">BROUILLONS QUI SERONT CRÉÉS</h3>

								<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
									{selectedSimulations.map(simulation => (
										<div
											key={simulation}
											className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-3"
										>
											<div className="rounded-md border bg-white p-2">
												<img src={sampleImage} alt={`${simulation}`} width={60} height={60} />
											</div>
											<div>
												<p className="font-medium text-gray-700">{simulation}</p>
												<div className="mt-1 inline-block rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700">
													Brouillon
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{(!createDrafts || selectedSimulations.length === 0) && (
							<div className="mb-6 rounded-lg bg-gray-50 p-6">
								<div className="flex items-center justify-between">
									<h3 className="text-primary font-medium">BROUILLONS QUI SERONT CRÉÉS</h3>
									<div className="text-gray-600">Aucune simulation enregistrée comme brouillon</div>
								</div>
							</div>
						)}

						<p className="mb-6 text-sm text-gray-700">
							Toutes les simulations non retenues ou non sauvegardées comme brouillon seront supprimées.
						</p>
					</div>
				)}

				<DialogFooter className="flex justify-between">
					{step !== "selection" && (
						<Button variant="outline" onClick={handleBack} className="flex items-center">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Retour
						</Button>
					)}

					{step === "final" ? (
						<Button onClick={handleFinalize} disabled={loading} className="bg-primary hover:bg-primary/90 ml-auto">
							{loading ? "Finalisation..." : <Check className="mr-2 h-4 w-4" />}
							Valider la conception
						</Button>
					) : (
						<Button
							onClick={handleConfirm}
							disabled={step === "selection" && !selectedProduct}
							className="bg-primary hover:bg-primary/90 ml-auto"
						>
							<Check className="mr-2 h-4 w-4" />
							{step === "drafts" ? "Confirmer" : step === "confirmation" ? "Confirmer" : "Continuer"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
