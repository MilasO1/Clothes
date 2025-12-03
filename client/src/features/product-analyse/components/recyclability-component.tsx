interface RecyclabilityComponentProps {
	componentRecyclability?: Record<string, number>[]
}

export default function RecyclabilityComponent({
	componentRecyclability = [{ Polyester: 90 }, { Polypropylène: 75 }],
}: RecyclabilityComponentProps) {
	return (
		<div className="flex max-w-5xl flex-col gap-4 md:flex-row">
			{/* Left panel - Dark teal background with title */}
			<div className="bg-primary flex w-full flex-col gap-2 items-center justify-center rounded-md p-8 text-center text-xl text-primary-foreground md:w-2/6">
				<h2 className="font-light tracking-wide uppercase">Analyse de la recyclabilité des</h2>
				<h1 className="font-bold uppercase">matières isolées</h1>
			</div>

			{/* Right panel - White background with recyclability metrics */}
			<div className="card-shape w-full md:w-3/5">
				<h2 className="text-primary mb-10 text-xl font-bold">Recyclabilité matière</h2>

				<div>
					{/* Rating scale labels - aligned with progress bars */}
					<div className="mb-8 grid grid-cols-[1fr_3fr] gap-3">
						<div></div> {/* Empty cell to align with material names */}
						<div className="relative flex justify-between border-b pb-2 font-bold">
							<span>Mauvaise</span>
							<span>Bonne</span>
						</div>
					</div>

					{/* Materials and progress bars */}
					{componentRecyclability.map((item, index) => {
						// Safely get the first key-value pair from the record
						if (!item || Object.keys(item).length === 0) return null

						const material = Object.keys(item)[0]
						const percentage = item[material]

						return (
							<div key={index} className="mb-6 grid grid-cols-[1fr_3fr] items-center gap-4">
								<div>{material}</div>
								<div className="space-y-2">
									<div className="relative h-2 w-full">
										{/* Progress bar track with subtle border */}
										<div className="absolute top-1/2 h-0.5 w-full -translate-y-1/2 border-t border-b border-gray-200 bg-gray-100"></div>

										{/* Actual progress bar */}
										<div
											className="bg-secondary absolute left-0 h-2 rounded-full"
											style={{ width: `${percentage}%` }}
										></div>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
