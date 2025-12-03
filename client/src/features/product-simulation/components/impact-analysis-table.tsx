import { ArrowDownIcon, DropletIcon, LeafIcon } from "lucide-react"

import MaterialDistributionCard from "./material-distribution-card"

interface ImpactAnalysisTableProps {
	environmentalCost: [number, number] // [reference, simulation]
	waterConsumption: [number, number] // [reference, simulation]
	microFiberEmission: [number, number] // [reference, simulation]
}

export default function ImpactAnalysisTable({
	environmentalCost,
	waterConsumption,
	microFiberEmission,
}: ImpactAnalysisTableProps) {
	// Calculate percentage difference for display
	const calculatePercentageDiff = (current: number, previous: number): string => {
		const diff = ((current - previous) / previous) * 100
		return diff > 0 ? `+${Math.round(diff)}%` : `${Math.round(diff)}%`
	}

	const simulationMaterials = [
		{ name: "Polypropylène", value: 60, color: "#006B77" },
		{ name: "Polyester", value: 15, color: "#FF8A00" },
		{ name: "Coton", value: 10, color: "#8884d8" },
	]

	return (
		<div className="mt-8">
			<div className="flex items-center justify-center overflow-x-auto">
				<div className="max-w-[900px]">
					{/* Row 0 */}
					<div className="flex items-stretch">
						<div className="flex-1 py-4 text-center">
							<MaterialDistributionCard materials={simulationMaterials} />
						</div>
						<div className="mx-16 flex min-h-[77px] w-[200px] items-center justify-center border-b py-4 text-center text-sm font-semibold">
							<div className="flex items-center gap-2">
								<span>Répartition des matières</span>
							</div>
						</div>
						<div className="flex-1 py-4 text-center">
							<MaterialDistributionCard materials={simulationMaterials} />
						</div>
					</div>
					{/* Row 1: Environmental Cost */}
					<div className="flex items-stretch">
						<div className="flex-1 border-b py-4 text-center">
							<div className="flex flex-col items-end">
								<div className="relative h-6 w-full max-w-[280px]">
									<div
										className="bg-secondary ml-auto flex h-full items-center justify-start rounded-sm pl-2"
										style={{
											width: `${(environmentalCost[0] / 100) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{environmentalCost[0]} Pts</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mx-16 flex min-h-[77px] w-[200px] items-center justify-center border-b py-4 text-center text-sm font-semibold">
							<div className="flex items-center gap-2">
								<LeafIcon className="h-5 w-5 text-green-600" />
								<span>Coût environnemental matière</span>
							</div>
						</div>
						<div className="flex-1 border-b py-4 text-center">
							<div className="flex flex-col items-start">
								<div className="relative h-6 w-full max-w-[280px]">
									<div
										className="bg-secondary flex h-full items-center justify-end rounded-sm pr-2"
										style={{
											width: `${(environmentalCost[1] / 100) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{environmentalCost[1]} Pts</span>
									</div>
								</div>
								<div className="flex w-full items-center justify-center">
									<span
										className={`text-xs ${environmentalCost[1] > environmentalCost[0] ? "text-red-600" : "text-green-600"} border font-medium ${environmentalCost[1] > environmentalCost[0] ? "border-red-600" : "border-green-600"} mt-1 inline-block rounded-full px-2`}
									>
										{calculatePercentageDiff(environmentalCost[1], environmentalCost[0])}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Row 3: Microfiber Emission */}
					<div className="flex">
						<div className="flex-1 py-4 text-center">
							<div className="flex flex-col items-end">
								<div className="relative h-6 w-full max-w-[280px]">
									<div
										className="bg-secondary ml-auto flex h-full items-center justify-start rounded-sm pl-2"
										style={{
											width: `${(microFiberEmission[0] / 100) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{microFiberEmission[0]} Pts</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mx-16 flex min-h-[77px] w-[200px] items-center justify-center py-4 text-center text-sm font-semibold">
							<div className="flex items-center gap-2">
								<ArrowDownIcon className="h-5 w-5 text-slate-700" />
								<span>Emission micro fibres</span>
							</div>
						</div>
						<div className="flex-1 py-4 text-center">
							<div className="flex flex-col items-start">
								<div className="relative h-6 w-full max-w-[280px]">
									<div
										className="bg-secondary flex h-full items-center justify-end rounded-sm pr-2"
										style={{
											width: `${(microFiberEmission[1] / 100) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{microFiberEmission[1]} Pts</span>
									</div>
								</div>
								<div className="flex w-full items-center justify-center">
									<span
										className={`text-xs ${microFiberEmission[1] > microFiberEmission[0] ? "text-red-600" : "text-green-600"} border font-medium ${microFiberEmission[1] > microFiberEmission[0] ? "border-red-600" : "border-green-600"} mt-1 inline-block rounded-full px-2`}
									>
										{calculatePercentageDiff(microFiberEmission[1], microFiberEmission[0])}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Row 2: Water Consumption */}
					<div className="flex">
						<div className="flex-1 border-b py-4 text-center">
							<div className="flex flex-col items-end">
								<div className="relative h-6 w-full max-w-[280px]">
									<div
										className="bg-secondary ml-auto flex h-full items-center justify-start rounded-sm pl-2"
										style={{
											width: `${(waterConsumption[0] / 100) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{waterConsumption[0]} L</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mx-16 flex min-h-[77px] w-[200px] items-center justify-center border-b py-4 text-center text-sm font-semibold">
							<div className="flex items-center gap-2">
								<DropletIcon className="h-5 w-5 text-blue-600" />
								<span>Consommation eau</span>
							</div>
						</div>
						<div className="flex-1 border-b py-4 text-center">
							<div className="flex flex-col items-start">
								<div className="relative h-6 w-full max-w-[280px]">
									<div
										className="bg-secondary flex h-full items-center justify-end rounded-sm pr-2"
										style={{
											width: `${(waterConsumption[1] / 100) * 100}%`,
										}}
									>
										<span className="text-xs font-medium text-white">{waterConsumption[1]} L</span>
									</div>
								</div>
								<div className="flex w-full items-center justify-center">
									<span
										className={`text-xs ${waterConsumption[1] > waterConsumption[0] ? "text-red-600" : "text-green-600"} border font-medium ${waterConsumption[1] > waterConsumption[0] ? "border-red-600" : "border-green-600"} mt-1 inline-block rounded-full px-2`}
									>
										{calculatePercentageDiff(waterConsumption[1], waterConsumption[0])}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
