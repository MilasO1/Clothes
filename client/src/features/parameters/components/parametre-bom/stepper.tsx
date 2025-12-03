import { useBOMStore } from "@/features/parameters/stores/bom"

export function Stepper() {
	const { currentStep, completedSteps, setCurrentStep } = useBOMStore()

	const steps = [
		{
			number: 1,
			title: "Importer une BILL OF MATERIAL",
			isActive: currentStep === 1,
			isCompleted: completedSteps.includes(1),
		},
		{
			number: 2,
			title: "Configurer les champs des BOM",
			isActive: currentStep === 2,
			isCompleted: completedSteps.includes(2),
		},
		{
			number: 3,
			title: "Tester le paramétrage & créer la clef",
			isActive: currentStep === 3,
			isCompleted: completedSteps.includes(3),
		},
	]

	const handleStepClick = (stepNumber: number) => {
		if (completedSteps.includes(stepNumber - 1) || stepNumber <= Math.max(...completedSteps, 0) + 1) {
			setCurrentStep(stepNumber)
		}
	}

	return (
		<div className="flex items-start gap-3">
			{steps.map(step => (
				<div
					key={step.number}
					className={`flex min-w-0 flex-1 cursor-pointer items-start gap-2 ${!step.isActive && !step.isCompleted ? "pointer-events-none opacity-60" : ""} `}
					onClick={() => {
						if (step.isCompleted || step.isActive) {
							handleStepClick(step.number)
						}
					}}
					role="button"
					tabIndex={step.isCompleted || step.isActive ? 0 : -1}
					aria-current={step.isActive ? "step" : undefined}
				>
					<div
						className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-all duration-300 ${
							step.isCompleted
								? "border-primary/60 bg-primary/60 text-white"
								: step.isActive
									? "border-primary text-primary"
									: "border-primary-foreground text-primary-foreground"
						} ${step.isActive ? "font-medium" : ""} `}
					>
						{step.isCompleted ? (
							<svg
								className="h-4 w-4"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path d="M5 13l4 4L19 7" />
							</svg>
						) : (
							step.number
						)}
					</div>
					<div className="min-w-0 flex-1">
						<h2
							className={`mb-1 truncate text-sm font-medium ${step.isActive ? "text-primary" : "text-primary-foreground"} `}
						>
							{step.title}
						</h2>
						<div className="relative h-1 overflow-hidden rounded-full bg-gray-200">
							<div
								className={`absolute inset-0 transition-all duration-500 ${step.isCompleted ? "bg-primary/60" : step.isActive ? "bg-primary" : "bg-gray-200"} `}
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
