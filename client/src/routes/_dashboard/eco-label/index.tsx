import { useState } from "react"

import { createFileRoute } from "@tanstack/react-router"

import { CircularityIndicators } from "@/features/eco-label/components/circularity-indicators"
import { InfoSection } from "@/features/eco-label/components/info-section"
import { LabelCreationForm } from "@/features/eco-label/components/label-creation-form"
import { PageHeader } from "@/features/eco-label/components/page-header"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/_dashboard/eco-label/")({
	component: EcoLabelPage,
})

function EcoLabelPage() {
	const [showLabelForm, setShowLabelForm] = useState(false)

	const handleCreateLabel = () => {
		setShowLabelForm(true)
	}

	const handleCancel = () => {
		setShowLabelForm(false)
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6 p-6">
			<Card className="p-6">
				<PageHeader title="Label éco conception interne - Darwie" />
				<Separator className="mb-6" />

				<div className="space-y-6">
					<InfoSection
						title="Qu'est ce que c'est?"
						content={
							<p>
								L&apos;éco label <span className="font-bold">interne</span>
								reprend l&apos;
								<span className="font-medium">
									ensemble des règles d&apos;éco conception que votre entreprise a défini défini
								</span>{" "}
								comme prioritaire afin de permettre à vos équipes de concevoir des produits en accord avec ces règles
							</p>
						}
					/>

					<InfoSection
						title="Quelles sont les bénéfices?"
						content={
							<ol className="list-inside list-decimal space-y-1">
								<li>Aligner les équipes de style et de design sur des règles communes</li>
								<li>
									Permettre aux équipes de communication de valoriser les partis pris d&apos;éco conception de la marque
								</li>
								<li>Mettre en valeur l&apos;éco conception faites auprès du client</li>
							</ol>
						}
					/>

					{!showLabelForm && (
						<div className="bg-accent flex flex-col items-center justify-center space-y-4 rounded-md p-6">
							<p className="text-gray-600">Aucun eco label</p>
							<Button onClick={handleCreateLabel}>Créer mon label</Button>
						</div>
					)}
				</div>
			</Card>

			{showLabelForm && <LabelCreationForm onCancel={handleCancel} />}

			<CircularityIndicators />
		</div>
	)
}
