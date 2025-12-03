interface ProgressBarProps {
	progress: number
}

export function ProgressBar({ progress = 60 }: ProgressBarProps) {
	// Ensure progress is between 0 and 100
	const clampedProgress = Math.min(Math.max(progress, 0), 100)

	// Determine if we should place the percentage inside the filled area
	const showInsideFill = clampedProgress > 80

	return (
		<div className="mx-auto w-full max-w-md">
			<div className="relative flex h-4 overflow-hidden border border-gray-200 bg-gray-100">
				{/* Progress fill */}
				<div
					className="bg-secondary relative mt-[3px] h-[60%] flex-shrink-0"
					style={{
						width: `${clampedProgress}%`,
					}}
				>
					{/* Percentage text inside filled area when progress > 80% */}
					{showInsideFill && (
						<div className="absolute inset-y-0 right-4 flex items-center">
							<span className="text-[8px] text-white">{clampedProgress}%</span>
						</div>
					)}
				</div>

				{/* Vertical border */}
				<div className="border-secondary h-full border-l-2" />

				{/* Percentage text container - only shown when progress <= 80% */}
				{!showInsideFill && (
					<div className="flex h-full flex-grow items-center justify-start bg-white pl-4">
						<span className="text-secondary text-sm font-bold">{clampedProgress}%</span>
					</div>
				)}
			</div>
		</div>
	)
}
