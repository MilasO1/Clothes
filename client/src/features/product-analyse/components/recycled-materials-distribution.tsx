interface RecycledMaterialsDistributionProps {
	materials?: {
		polyester: number
		polypropylene: number
		nonRecycled: number
	}
}

export default function RecycledMaterialsDistribution({
	materials = {
		polyester: 53.8,
		polypropylene: 20.0,
		nonRecycled: 26.2,
	},
}: RecycledMaterialsDistributionProps) {
	return (
		<div className="flex max-w-5xl flex-col gap-4 md:flex-row">
			<div className="bg-primary flex w-full flex-col items-center justify-center rounded-md p-8 text-center text-primary-foreground md:w-2/6">
				<h2 className="text-xl font-light tracking-wide uppercase">Analyse de la recyclabilité du</h2>
				<h1 className="mt-2 text-xl font-bold uppercase">produit assemblé</h1>
			</div>

			<div className="card-shape w-full md:w-3/5">
				<h2 className="text-primary mb-8 text-left text-xl font-bold">Répartition matières recyclées</h2>

				<div className="mb-10">
					<div className="relative mb-2 flex">
						{materials.polyester > 0 && (
							<div style={{ width: `${materials.polyester}%` }} className="text-center">
								<span className="text-primary text-md font-bold">{materials.polyester}%</span>
							</div>
						)}
						{materials.polypropylene > 0 && (
							<div style={{ width: `${materials.polypropylene}%` }} className="text-center">
								<span className="text-primary text-md font-bold">{materials.polypropylene}%</span>
							</div>
						)}
						{materials.nonRecycled > 0 && (
							<div style={{ width: `${materials.nonRecycled}%` }} className="text-center">
								<span className="text-md font-bold text-[#E57373]">{materials.nonRecycled}%</span>
							</div>
						)}
					</div>

					{/* Progress bar */}
					<div className="rounded-sm">
						<div className="flex h-8 w-full">
							{/* Polyester section */}
							{materials.polyester > 0 && (
								<div
									className="flex h-full items-center justify-center bg-[#E0F2F1]"
									style={{ width: `${materials.polyester}%` }}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 text-[#2A9D8F]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</div>
							)}

							{/* Polypropylene section */}
							{materials.polypropylene > 0 && (
								<div
									className="flex h-full items-center justify-center bg-[#B2DFDB]"
									style={{ width: `${materials.polypropylene}%` }}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 text-[#2A9D8F]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</div>
							)}

							{/* Non-recycled section */}
							{materials.nonRecycled > 0 && (
								<div
									className="flex h-full items-center justify-center bg-[#FFCDD2]"
									style={{ width: `${materials.nonRecycled}%` }}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6 text-[#E57373]"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
										/>
									</svg>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Legend */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{/* Only show legend items for materials with values > 0 */}
					{materials.polyester > 0 && (
						<div className="flex items-center">
							<div className="mr-2 h-6 w-6 bg-[#E0F2F1]"></div>
							<span className="text-sm">Recyclage Polyester</span>
						</div>
					)}

					{materials.polypropylene > 0 && (
						<div className="flex items-center">
							<div className="mr-2 h-6 w-6 bg-[#B2DFDB]"></div>
							<span className="text-sm">Recyclage Polypropylène</span>
						</div>
					)}

					{materials.nonRecycled > 0 && (
						<div className="flex items-center">
							<div className="mr-2 h-6 w-6 bg-[#FFCDD2]"></div>
							<span className="text-sm">Matières non recyclées</span>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
