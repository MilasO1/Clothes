import drapeauFrancais from "@/assets/french-flag.png"
import drapeauEurope from "@/assets/eu-flag.jpg"

interface ComponentCount {
	etoffes: number
	accessoires: number
	impressions: number
	etiquettes: number
}

interface ProductAnalysisTableProps {
	// Each array contains [reference, simulation] values
	ecoLabelInterne: [string, string]
	affichageEnvi: [number, number]
	scorePEF: [number, number]
	labelMatieres: [string, string]
	coutRevient: [number, number]

	// Object with reference and simulation component counts
	nombreComposants: {
		reference: ComponentCount
		simulation: ComponentCount
	}

	// Percentages for material responsibility score
	scoreMatiere: [number, number]
}

export default function ProductAnalysisTable({
	ecoLabelInterne,
	affichageEnvi,
	scorePEF,
	labelMatieres,
	coutRevient,
	nombreComposants,
	scoreMatiere,
}: ProductAnalysisTableProps) {
	// Calculate percentage difference for display
	const calculatePercentageDiff = (current: number, previous: number): string => {
		const diff = ((current - previous) / previous) * 100
		return diff > 0 ? `+${Math.round(diff)}%` : `${Math.round(diff)}%`
	}

	// Get total components for reference and simulation
	const getTotalComponents = (components: ComponentCount) => {
		return components.etoffes + components.accessoires + components.impressions + components.etiquettes
	}

	const refTotalComponents = getTotalComponents(nombreComposants.reference)
	const simTotalComponents = getTotalComponents(nombreComposants.simulation)

	// Find the maximum value across all bars for consistent scaling
	const maxValue = Math.max(...affichageEnvi, ...scorePEF)

	return (
		<div className="mt-8">
			<div className="mb-4 flex items-center gap-2">
				<h2 className="text-secondary text-xl font-medium">Analyse générale des produits</h2>
				<div className="bg-secondary h-[1px] flex-grow" />
			</div>

			<div className="flex justify-center overflow-x-auto">
				<div className="max-w-[900px]">
					{/* Row 1: Eco-label interne */}
					<div className="flex">
						<div className="flex-1 border-b py-3 text-center">
							<span className="rounded-md border px-3 py-1 text-sm">{ecoLabelInterne[0] || "Non attribué"}</span>
						</div>
						<div className="mx-16 w-[200px] border-b py-3 text-center text-sm font-semibold">Eco-label interne</div>
						<div className="flex-1 border-b py-3 text-center">
							<span className="rounded-md border px-3 py-1 text-sm">{ecoLabelInterne[1] || "Non attribué"}</span>
						</div>
					</div>

					{/* Row 2: Affichage environnemental */}
					<div className="flex items-stretch">
						<div className="flex min-h-[87px] flex-1 items-center justify-end border-b py-3 text-center">
							<div className="h-5 w-full max-w-[280px] overflow-hidden rounded-sm">
								<div
									className="bg-secondary ml-auto flex h-full items-center justify-start rounded-sm pl-2"
									style={{
										width: `${(affichageEnvi[0] / maxValue) * 100}%`,
									}}
								>
									<span className="text-xs font-medium text-white">{affichageEnvi[0]} Pts</span>
								</div>
							</div>
						</div>
						<div className="fx-center justify-between mx-16 min-h-[87px] w-[200px] border-b py-3 text-center text-sm font-semibold">
							<img src={drapeauFrancais} alt="French Flag" width={36} height={36} className="object-cover" />
							<span className="mx-auto">Affichage environnemental</span>
						</div>
						<div className="flex min-h-[87px] flex-1 items-center justify-center border-b py-3 text-center">
							<div className="flex w-full flex-col items-start">
								<div className="h-5 w-full max-w-[280px] overflow-hidden rounded-sm">
									<div
										className="bg-secondary mr-auto flex h-full items-center justify-end rounded-sm pr-2"
										style={{
											width: `${(affichageEnvi[1] / maxValue) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{affichageEnvi[1]} Pts</span>
									</div>
								</div>
								<div className="mt-1 flex w-[280px] justify-center gap-1">
									<span
										className={`text-xs ${affichageEnvi[1] > affichageEnvi[0] ? "text-red-600" : "text-green-600"} border font-medium ${affichageEnvi[1] > affichageEnvi[0] ? "border-red-600" : "border-green-600"} inline-block rounded-full px-2`}
									>
										{calculatePercentageDiff(affichageEnvi[1], affichageEnvi[0])}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Row 3: Score PEF */}
					<div className="flex items-stretch">
						<div className="flex min-h-[87px] flex-1 items-center justify-end border-b py-3 text-center">
							<div className="h-5 w-full max-w-[280px] overflow-hidden rounded-sm">
								<div
									className="bg-secondary ml-auto flex h-full items-center justify-start rounded-sm pl-2"
									style={{
										width: `${(scorePEF[0] / maxValue) * 100}%`,
									}}
								>
									<span className="text-xs font-medium text-white">{scorePEF[0]} μPts</span>
								</div>
							</div>
						</div>
						<div className="fx-center justify-between mx-16 min-h-[87px] w-[200px] border-b py-3 text-center text-sm font-semibold">
							<img src={drapeauEurope} alt="EU Flag" width={36} height={36} className="object-cover" />
							<span className="mx-auto">Score PEF</span>
						</div>
						<div className="flex min-h-[87px] flex-1 items-center justify-center border-b py-3 text-center">
							<div className="flex w-full flex-col items-start">
								<div className="flex h-5 w-full max-w-[280px] justify-center overflow-hidden rounded-sm">
									<div
										className="bg-secondary mr-auto flex h-full items-center justify-end rounded-sm pr-2"
										style={{
											width: `${(scorePEF[1] / maxValue) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{scorePEF[1]} μPts</span>
									</div>
								</div>
								<div className="mt-1 flex w-[280px] justify-center gap-1">
									<span
										className={`text-xs ${scorePEF[1] > scorePEF[0] ? "text-red-600" : "text-green-600"} border font-medium ${scorePEF[1] > scorePEF[0] ? "border-red-600" : "border-green-600"} inline-block rounded-full px-2`}
									>
										{calculatePercentageDiff(scorePEF[1], scorePEF[0])}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Row 4: Labels matières */}
					<div className="flex">
						<div className="flex-1 border-b py-3 text-center text-sm text-gray-400">
							{labelMatieres[0] || "Aucun label"}
						</div>
						<div className="mx-16 w-[200px] border-b py-3 text-center text-sm font-semibold">Labels matières</div>
						<div className="flex-1 border-b py-3 text-center text-sm text-gray-400">
							{labelMatieres[1] || "Aucun label"}
						</div>
					</div>

					{/* Row 5: Coût de revient produit */}
					<div className="flex">
						<div className="flex-1 border-b py-3 text-center">
							<span className="font-medium">{coutRevient[0]} €</span>
						</div>
						<div className="mx-16 w-[200px] border-b py-3 text-center text-sm font-semibold">
							Coût de revient produit
						</div>
						<div className="flex-1 border-b py-3 text-center">
							<div className="flex items-center justify-center gap-2">
								<span className="font-medium">{coutRevient[1]} €</span>
								<span
									className={`text-xs ${coutRevient[1] < coutRevient[0] ? "text-green-600" : "text-red-600"} border font-medium ${coutRevient[1] < coutRevient[0] ? "border-green-600" : "border-red-600"} inline-block rounded-full px-2`}
								>
									{calculatePercentageDiff(coutRevient[1], coutRevient[0])}
								</span>
							</div>
						</div>
					</div>

					{/* Row 6: Nombre de composants */}
					<div className="flex">
						<div className="flex-1 border-b py-3 text-center text-sm">
							<div className="text-secondary">
								{refTotalComponents} composant
								{refTotalComponents > 1 ? "s" : ""}
							</div>
							<div className="text-xs text-gray-600">
								{nombreComposants.reference.etoffes} étoffe
								{nombreComposants.reference.etoffes > 1 ? "s" : ""}, {nombreComposants.reference.accessoires} accessoire
								{nombreComposants.reference.accessoires > 1 ? "s" : ""}, {nombreComposants.reference.impressions}{" "}
								impression
								{nombreComposants.reference.impressions > 1 ? "s" : ""}, {nombreComposants.reference.etiquettes}{" "}
								étiquette
								{nombreComposants.reference.etiquettes > 1 ? "s" : ""}
							</div>
						</div>
						<div className="mx-16 w-[200px] border-b py-3 text-center text-sm font-semibold">Nombre de composants</div>
						<div className="flex-1 border-b py-3 text-center text-sm">
							<div className="text-secondary">
								{simTotalComponents} composant
								{simTotalComponents > 1 ? "s" : ""}
							</div>
							<div className="text-xs text-gray-600">
								{nombreComposants.simulation.etoffes} étoffe
								{nombreComposants.simulation.etoffes > 1 ? "s" : ""}, {nombreComposants.simulation.accessoires}{" "}
								accessoire
								{nombreComposants.simulation.accessoires > 1 ? "s" : ""}, {nombreComposants.simulation.impressions}{" "}
								impression
								{nombreComposants.simulation.impressions > 1 ? "s" : ""}, {nombreComposants.simulation.etiquettes}{" "}
								étiquette
								{nombreComposants.simulation.etiquettes > 1 ? "s" : ""}
							</div>
						</div>
					</div>

					{/* Row 7: Score matières responsable */}
					<div className="flex">
						<div className="flex-1 py-3 text-center">
							<div className="flex flex-col items-end">
								<span className="mb-1 w-[280px] text-center font-medium">{scoreMatiere[0]}%</span>
								<div className="relative h-4 w-full max-w-[280px]">
									{/* Thin gray background line */}
									<div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 transform bg-gray-300"></div>
									{/* Thicker colored progress bar */}
									<div
										className="bg-secondary absolute top-1/2 h-[7px] -translate-y-1/2 transform"
										style={{ width: `${scoreMatiere[0]}%`, right: 0 }}
									></div>
								</div>
							</div>
						</div>
						<div className="mx-16 mt-[13px] flex h-[68px] w-[200px] items-center justify-center py-3 text-center text-sm font-semibold">
							Score matières responsable
						</div>
						<div className="flex-1 py-3 text-center">
							<div className="flex flex-col items-start">
								<div className="mb-1 flex items-center justify-center gap-2">
									<div className="flex w-[280px] items-center justify-center gap-2">
										<span className="text-center font-medium">{scoreMatiere[1]}%</span>
										<span
											className={`text-xs ${scoreMatiere[1] > scoreMatiere[0] ? "text-green-600" : "text-red-600"} border font-medium ${scoreMatiere[1] > scoreMatiere[0] ? "border-green-600" : "border-red-600"} inline-block rounded-full px-2`}
										>
											{calculatePercentageDiff(scoreMatiere[1], scoreMatiere[0])}
										</span>
									</div>
								</div>
								<div className="relative h-4 w-full max-w-[280px]">
									{/* Thin gray background line */}
									<div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 transform bg-gray-300"></div>
									{/* Thicker colored progress bar */}
									<div
										className="bg-secondary absolute top-1/2 left-0 h-[7px] -translate-y-1/2 transform"
										style={{ width: `${scoreMatiere[1]}%` }}
									></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
