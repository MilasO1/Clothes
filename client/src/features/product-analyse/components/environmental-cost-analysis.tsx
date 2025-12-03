import { Fragment, useState } from "react"
import { Calculator, Check, ChevronDown, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

import { rd } from "@/components/utils"
import api from "@/contexts/apiQueries"

import type { Country } from "@/features/produits/types/index"
import { useEnvironmentalCalculation } from "@/features/produits/hooks/useEnvironmentalCalculation"
import { useSupplyChain } from "@/features/produits/hooks/useSupplyChain"

import { ecobalyseCountries, masseTotale } from "@/features/produits/business"

import etiquetteCoutEnv from "@/assets/cout environnemental.avif"

export default function EnvironmentalCostAnalysis({ produit }) {
	const [open, setOpen] = useState(false)
	const [showFullModal, setShowFullModal] = useState(false)

	const { data: pureMatieres = [] } = api.produits.pureMatieres(produit.id)
	const [materialRows, setMaterialRows] = useState(
		pureMatieres.map(mat => ({
			id: mat.id,
			nom: mat.nom,
			country: "---",
		}))
	)
	const updateMaterialCountry = (index, countryCode) => {
		setMaterialRows(prev => prev.map((row, idx) => (idx === index ? { ...row, country: countryCode } : row)))
	}

	const { procedeRows, airTransportPercent, updateProcede, updateAirTransportPercent, resetSupplyChain } =
		useSupplyChain()

	const { calculateImpact, impactResults, isCalculating } = useEnvironmentalCalculation(produit.id)

	const openModal = () => {
		setOpen(true)
		setShowFullModal(false)
		resetSupplyChain()
	}

	const continueToNextStep = () => setShowFullModal(true)

	const handleCalculateImpact = () => {
		calculateImpact(materialRows, procedeRows, airTransportPercent)
	}

	const totalMass = masseTotale(produit, "totalMass")

	return (
		<Fragment>
			<button
				onClick={openModal}
				className="group flex size-52 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-muted-foreground/30 p-6 hover:shadow-sm bg-background3"
			>
				<div className="flex w-full max-w-xs flex-col items-center">
					<div className="mb-3">
						<div className="relative flex items-center justify-center gap-1 rounded-lg border border-muted-foreground/30 p-2 bg-background3 font-semibold">
							<Calculator className="text-muted-foreground size-6" />
							<span className="text-muted-foreground">Lancer le calcul</span>
						</div>
					</div>
					<span className="text-muted-foreground group-hover:font-medium">Affichage environnemental</span>
				</div>
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="my-4 max-h-4/5 w-3/4 max-w-2xl gap-0 overflow-hidden rounded-lg p-0 shadow-xl">
					<div className="sticky top-0 z-10 flex items-center justify-between rounded-t-md border-b border-border bg-background2 p-4 shadow-sm">
						<DialogDescription className="sr-only">Impact</DialogDescription>
						<div>
							<DialogTitle className="text-primary text-lg font-medium">Analyse du coût environnemental</DialogTitle>
							<div className="mt-1 flex space-x-2">
								<span className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">Simplifié</span>
								<span className="rounded bg-secondary px-2 py-1 text-xs text-primary-foreground">BETA</span>
							</div>
						</div>
						{impactResults && (
							<>
								<div className="flex items-center">
									<div className="relative size-full">
										<img src={etiquetteCoutEnv} alt="cout environnemental" width={90} height={75} />
										<span className="absolute top-3.5 w-full text-right pr-1 font-bold text-muted-foreground text-sm">
											{Math.round(impactResults.ecs || 0)}&nbsp;Pts
										</span>
									</div>
								</div>
								<div className="bg-background3 rounded border border-border px-3 py-1 shadow-sm">
									<div className="text-xs text-muted-foreground">Score PEF</div>
									<div className="font-bold text-foreground text-sm">{Math.round(impactResults.pef || 0)} Pts</div>
								</div>
							</>
						)}
						<DialogClose asChild>
							<Button variant="ghost" className="has-[>svg]:px-2">
								<XIcon className="size-6" />
							</Button>
						</DialogClose>
					</div>

					<ScrollArea className="h-[calc(75vh-7rem)]">
						<div className="overflow-y-auto py-4 px-5">
							<div className="mb-4">
								<div className="mb-3 flex items-center">
									<div className="border-primary text-primary mr-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold">
										1
									</div>
									<h3 className="text-primary text-sm font-medium">Définir les paramètres de base</h3>
								</div>
								<div className="grid grid-cols-2 gap-3 mb-2">
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium text-foreground">Masse du produit</label>
										<Input readOnly defaultValue={rd(totalMass, 3) + " kg"} />
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-sm font-medium text-foreground">Type de produit</label>
										<Input readOnly defaultValue={produit.type} />
									</div>
								</div>
							</div>

							<hr className="my-4 border-border" />

							<div className="mb-4">
								<div className="mb-3 flex items-center">
									<div className="border-primary text-primary mr-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold">
										2
									</div>
									<h3 className="text-primary text-sm font-medium">Définir le mix matière</h3>
								</div>

								{materialRows.length > 0 ? (
									<div className="mb-3">
										{materialRows.map((mat, index) => (
											<div key={mat.id} className="mb-3">
												<div className="flex overflow-hidden rounded border border-border shadow-sm">
													<div className="text-primary flex w-2/5 items-center justify-center p-3 text-center text-sm font-medium">
														{mat.nom}
													</div>
													<div className="relative w-3/5 border-l border-border">
														<select
															className="h-full w-full appearance-none border-0 bg-background2 px-3 py-2 text-sm text-foreground focus:ring-0 focus:outline-none"
															value={mat.country}
															onChange={e => updateMaterialCountry(index, e.target.value)}
														>
															{ecobalyseCountries.map((country: Country) => (
																<option key={country.code} value={country.code}>
																	{country.name}
																</option>
															))}
														</select>
														<ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="mb-3 text-center text-sm text-muted-foreground">Aucune matière trouvée</div>
								)}
							</div>

							{showFullModal && (
								<Fragment>
									<hr className="my-4 border-border" />
									<div className="mb-4">
										<div className="mb-3 flex items-center">
											<div className="border-primary text-primary mr-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold">
												3
											</div>
											<h3 className="text-primary text-sm font-medium">Modéliser la chaîne logistique</h3>
										</div>

										{procedeRows.map(proc => (
											<div key={proc.type} className="mb-3">
												<div className="flex overflow-hidden rounded border border-border shadow-sm">
													<div className="text-primary flex w-2/5 items-center justify-center p-3 text-center text-sm font-medium">
														{proc.name}
													</div>
													<div className="relative w-3/5 border-l border-border">
														<select
															className="h-full w-full appearance-none border-0 bg-background2 px-3 py-2 text-sm text-foreground focus:ring-0 focus:outline-none"
															value={proc.country}
															onChange={e => updateProcede(proc.type, e.target.value)}
														>
															{ecobalyseCountries.map((country: Country) => (
																<option key={country.code} value={country.code}>
																	{country.name}
																</option>
															))}
														</select>
														<ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
													</div>
												</div>
											</div>
										))}

										{/* Air Transport Slider*/}
										<div className="mb-4 mt-5 flex justify-center">
											<div className="w-3/5">
												<div className="flex items-center justify-between mb-2">
													<label className="text-sm font-medium text-foreground">Transport aérien</label>
													<span className="text-sm text-muted-foreground">{airTransportPercent}%</span>
												</div>
												<input
													type="range"
													min="0"
													max="100"
													value={airTransportPercent}
													onChange={e => updateAirTransportPercent(e.target.valueAsNumber)}
													className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
													style={{
														background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${airTransportPercent}%, var(--color-border) ${airTransportPercent}%, var(--color-border) 100%)`,
													}}
												/>
												<div className="flex justify-between text-xs text-muted-foreground mt-1">
													<span>0%</span>
													<span>100%</span>
												</div>
											</div>
										</div>

										<div className="flex h-16 items-stretch justify-center gap-3">
											<Button className="h-full text-sm px-4" onClick={handleCalculateImpact} disabled={isCalculating}>
												{isCalculating ? (
													"Calcul en cours..."
												) : (
													<>
														<svg
															width="16"
															height="16"
															viewBox="0 0 24 24"
															fill="none"
															xmlns="http://www.w3.org/2000/svg"
														>
															<rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
															<rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
															<rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
															<rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
														</svg>
														Lancer le calcul
													</>
												)}
											</Button>
										</div>
									</div>
								</Fragment>
							)}

							{!showFullModal && (
								<div className="mt-6 flex justify-center">
									<button
										onClick={continueToNextStep}
										className="flex items-center gap-2 rounded-full border border-border bg-background2 px-4 py-2 text-sm hover:bg-background3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
									>
										<Check className="text-primary h-4 w-4" />
										<span className="text-foreground">Continuer</span>
									</button>
								</div>
							)}
						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</Fragment>
	)
}
