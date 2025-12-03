import { cn } from "@/components/utils"

import { TooltipContent, TooltipProvider, TooltipTrigger, Tooltip as TooltipUI } from "@/components/ui/tooltip"

interface RecyclabilityAnalysisTableProps {
	// Each array contains [reference, simulation] values
	recyclabilityScore: [number, number]
	recycledMaterials: {
		reference: { nom: string; description: string }[]
		simulation: { nom: string; description: string }[]
	}
	nonRecycledComponents: {
		reference: string[]
		simulation: string[]
	}
	disassemblySteps: [number, number]
}

export default function RecyclabilityAnalysisTable({
	recyclabilityScore,
	recycledMaterials,
	nonRecycledComponents,
	disassemblySteps,
}: RecyclabilityAnalysisTableProps) {
	return (
		<div className="mt-8">
			<div className="mb-4 flex items-center gap-2">
				<h2 className="text-secondary text-xl font-medium">Analyse recyclabilité produit</h2>
				<div className="bg-secondary h-[1px] flex-grow" />
			</div>

			<div className="flex items-center justify-center overflow-x-auto">
				<div className="max-w-[900px]">
					{/* Row 1: Recyclabilité produit */}
					<div className="flex">
						<div className="flex-1 border-b py-4 text-center">
							<div className="flex flex-col items-end">
								<span className="mb-1 w-[280px] text-center font-medium">{recyclabilityScore[0]}%</span>
								<div className="relative h-4 w-full max-w-[280px]">
									{/* Thin gray background line */}
									<div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 transform bg-gray-300"></div>
									{/* Thicker colored progress bar */}
									<div
										className="bg-secondary absolute top-1/2 h-[7px] -translate-y-1/2 transform"
										style={{ width: `${recyclabilityScore[0]}%`, right: 0 }}
									></div>
								</div>
							</div>
						</div>
						<div className="mx-16 flex h-[77px] w-[200px] items-center justify-center border-b py-4 text-center text-sm font-semibold">
							Recyclabilité produit
						</div>
						<div className="flex-1 border-b py-4 text-center">
							<div className="flex flex-col items-start">
								<div className="mb-1 flex items-center justify-center gap-2">
									<div className="flex w-[280px] items-center justify-center gap-2">
										<span className="text-center font-medium">{recyclabilityScore[1]}%</span>
										<span
											className={`text-xs ${recyclabilityScore[1] > recyclabilityScore[0] ? "text-green-600" : "text-red-600"} border font-medium ${recyclabilityScore[1] > recyclabilityScore[0] ? "border-green-600" : "border-red-600"} inline-block rounded-full px-2`}
										>
											{((recyclabilityScore[1] - recyclabilityScore[0]) / recyclabilityScore[0]) * 100 > 0
												? `+${(((recyclabilityScore[1] - recyclabilityScore[0]) / recyclabilityScore[0]) * 100).toFixed(0)}%`
												: `${(((recyclabilityScore[1] - recyclabilityScore[0]) / recyclabilityScore[0]) * 100).toFixed(0)}%`}
										</span>
									</div>
								</div>
								<div className="relative h-4 w-full max-w-[280px]">
									{/* Thin gray background line */}
									<div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 transform bg-gray-300"></div>
									{/* Thicker colored progress bar */}
									<div
										className="bg-secondary absolute top-1/2 left-0 h-[7px] -translate-y-1/2 transform"
										style={{ width: `${recyclabilityScore[1]}%` }}
									></div>
								</div>
							</div>
						</div>
					</div>

					{/* Row 2: Matières recyclées */}
					<div className="flex">
						<div className="flex-1 border-b py-4 text-center">
							<TooltipProvider>
								<div
									className={cn(
										"flex items-center justify-center",
										recycledMaterials.reference.length >= 2 && "grid grid-cols-2 gap-2"
									)}
								>
									{recycledMaterials.reference.length > 0 ? (
										recycledMaterials.reference.map(material => {
											const { nom, description } = material
											return (
												<TooltipUI key={nom}>
													<TooltipTrigger asChild>
														<button
															type="button"
															className="flex max-w-full min-w-fit items-center justify-center rounded-md border px-3 py-1 font-semibold text-gray-600 hover:bg-gray-50"
														>
															{nom}
														</button>
													</TooltipTrigger>
													<TooltipContent className="bg-background border-primary text-primary border">
														<p>{description}</p>
													</TooltipContent>
												</TooltipUI>
											)
										})
									) : (
										<p className="text-gray-400">Aucune matière recyclée</p>
									)}
								</div>
							</TooltipProvider>
						</div>
						<div className="mx-16 w-[200px] border-b py-4 text-center text-sm font-semibold">Matières recyclées</div>
						<div className="flex-1 border-b py-4 text-center">
							<TooltipProvider>
								<div
									className={cn(
										"flex items-center justify-center",
										recycledMaterials.simulation.length >= 2 && "grid grid-cols-2 gap-2"
									)}
								>
									{recycledMaterials.simulation.length > 0 ? (
										recycledMaterials.simulation.map(material => {
											const { nom, description } = material
											return (
												<TooltipUI key={nom}>
													<TooltipTrigger asChild>
														<button
															type="button"
															className="flex max-w-full min-w-fit items-center justify-center rounded-md border px-3 py-1 font-semibold text-gray-600 hover:bg-gray-50"
														>
															{nom}
														</button>
													</TooltipTrigger>
													<TooltipContent className="bg-background border-primary text-primary border">
														<p>{description}</p>
													</TooltipContent>
												</TooltipUI>
											)
										})
									) : (
										<p className="text-gray-400">Aucune matière recyclée</p>
									)}
								</div>
							</TooltipProvider>
						</div>
					</div>

					{/* Row 3: Composants non recyclés */}
					<div className="flex">
						<div className="flex-1 border-b py-4 text-center text-gray-400">
							{nonRecycledComponents.reference.length > 0
								? nonRecycledComponents.reference.map(component => (
										<p key={component} className="text-destructive">
											{component}
										</p>
									))
								: "aucun composant non recyclés"}
						</div>
						<div className="mx-16 w-[200px] border-b py-4 text-center text-sm font-semibold">
							Composants non recyclés
						</div>
						<div className="flex-1 border-b py-4 text-center text-gray-400">
							{nonRecycledComponents.simulation.length > 0
								? nonRecycledComponents.simulation.map(component => (
										<p key={component} className="text-destructive">
											{component}
										</p>
									))
								: "aucun composant non recyclés"}
						</div>
					</div>

					{/* Row 4: Nombre minimum étapes au démantèlement */}
					<div className="flex">
						<div className="flex-1 py-4 text-center">{disassemblySteps[0]}</div>
						<div className="mx-16 w-[200px] py-4 text-center text-sm font-semibold">
							Nombre minimum étapes au démantèlement
						</div>
						<div className="flex-1 py-4 text-center">{disassemblySteps[1]}</div>
					</div>
				</div>
			</div>
		</div>
	)
}
