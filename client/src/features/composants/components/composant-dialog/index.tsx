import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	addComposantSchema,
	step1Schema,
	step2Schema,
	type AddComposantFormData,
	type Step1FormData,
	type Step2FormData,
} from "./schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/components/utils"
import { Form } from "@/components/ui/form"
import Step1Form from "./forms/step1-form"
import { Step2Form } from "./forms/step2-form"

import api from "@/contexts/apiQueries.js"
import { composantTypes, currencies, nonMassUnits } from "@/features/composants/types"

interface ComposantDialogProps {
	isOpen: boolean
	onClose: () => void
	resource?
}

export default function ComposantDialog({ isOpen, onClose, resource }: ComposantDialogProps) {
	const [currentStep, setCurrentStep] = useState<number>(1)
	const [formData, setFormData] = useState<Partial<AddComposantFormData>>({})
	const { mutateAsync: create } = api.composants.create()
	const { mutateAsync: update } = api.composants.update()

	const step1Form = useForm<Step1FormData>({
		resolver: zodResolver(step1Schema),
		mode: "onChange",
	})
	const step2Form = useForm<Step2FormData>({
		resolver: zodResolver(step2Schema),
		mode: "onChange",
	})

	useEffect(() => {
		if (isOpen) {
			// This is better than the form default values
			// because react-hook does not reinitialize the form at each re-render
			step1Form.reset({
				nom: resource?.nom ?? "",
				type: resource?.type ?? composantTypes[0],
				reference: resource?.reference ?? "",
			})
			step2Form.reset({
				matiere: resource?.matiere ?? "",
				monnaie: resource?.monnaie ?? currencies[0],
				unite: resource?.unite ?? nonMassUnits[0],
				masseUnitaire: resource?.masseUnitaire ?? 0,
				prixUnitaire: resource?.prixUnitaire ?? 0,
			})
		}
	}, [isOpen, resource, step1Form, step2Form])

	const handleNext = async () => {
		let isValid = false

		if (currentStep === 1) {
			isValid = await step1Form.trigger()
			if (isValid) {
				const data = step1Form.getValues()
				setFormData(prev => ({ ...prev, ...data }))
			}
		}
		if (isValid) {
			setCurrentStep(prev => prev + 1)
		}
	}

	const handlePrevious = () => {
		setCurrentStep(prev => prev - 1)
	}

	const handleSubmit = async () => {
		const isValid = await step2Form.trigger()
		if (isValid) {
			const finalData = { ...formData, ...step2Form.getValues() }
			try {
				const validatedData = addComposantSchema.parse(finalData) // for string coercion

				// To be implemented once the customer wants them
				validatedData.specificType = undefined

				onClose()
				if (resource) {
					console.log("updating")
					await update({ rscId: resource.id, body: validatedData })
				} else {
					console.log("creating")
					await create(validatedData)
				}

				handleCloseReset()
			} catch (error) {
				console.error("Validation error:", error)
			}
		}
	}

	const handleCloseReset = () => {
		onClose()
		step1Form.reset()
		step2Form.reset()
		setCurrentStep(1)
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleCloseReset}>
			<DialogContent className="p-0 sm:max-w-[900px]">
				<DialogHeader className="h-16 rounded-t-md border-b bg-background2 px-6">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-primary text-xl font-bold py-4">
							{resource?.nom || "Créer un composant"}
						</DialogTitle>
						<Button variant="ghost" size="icon" onClick={handleCloseReset}>
							<X className="size-7" />
						</Button>
					</div>
					<DialogDescription className="sr-only">Creation</DialogDescription>
				</DialogHeader>

				{currentStep === 1 && (
					<Form {...step1Form}>
						<Step1Form form={step1Form} />
					</Form>
				)}
				{currentStep === 2 && (
					<Form {...step2Form}>
						<Step2Form form={step2Form} />
					</Form>
				)}

				<DialogFooter className="px-6 pb-6">
					<div className="flex w-full items-center justify-between">
						{currentStep !== 1 ? (
							<Button variant={"outline"} className={"gap-2"} onClick={handlePrevious}>
								<ArrowLeft className="h-4 w-4" />
								Retour
							</Button>
						) : (
							<Button
								variant="ghost"
								className="px-4 text-gray-500 hover:bg-gray-100/80 hover:text-gray-700"
								onClick={handleCloseReset}
							>
								<X className="mr-2 h-4 w-4" />
								Annuler
							</Button>
						)}

						<div className="flex gap-4">
							{[1, 2].map(step => (
								<div
									key={step}
									className={cn("h-4 w-4 rounded-full", step === currentStep ? "bg-primary" : "bg-gray-500/40")}
									onClick={() => setCurrentStep(step)}
								/>
							))}
						</div>

						{currentStep < 2 ? (
							<Button onClick={handleNext}>
								Suivant
								<ArrowRight className="ml-2 size-4" />
							</Button>
						) : (
							<Button onClick={handleSubmit}>Valider</Button>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
