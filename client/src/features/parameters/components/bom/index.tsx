import { useState } from "react"

import { Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import ParametreBomPage from "../parametre-bom"

export default function ParametrageBom() {
	const [activeStep, setActiveStep] = useState(1)
	return (
		<div className="mx-auto max-w-4xl p-6">
			{activeStep === 1 ? (
				<Card className="rounded-md p-6 shadow-none">
					<h2 className="text-primary mb-4 text-xl font-semibold">Consigne préalables</h2>

					<p className="mb-4">
						Pour importer des Bill of Material issues de vos systèmes d&apos;informations, nous avons besoin de savoir
						comment sont constituées vos Bill of material.
					</p>

					<p className="mb-8">
						Pour cela, il sera nécessaire de paramétrer le BOM connector et de créer des clefs de conversion de la
						manière suivante :
					</p>

					<div className="mb-8 grid gap-6 md:grid-cols-3">
						{[
							{
								title: (
									<span>
										<strong>Parcourir la BOM Darwie</strong> pour connaitre les intitulés des champs demandés.
									</span>
								),
								number: 1,
							},
							{
								title: (
									<span>
										Ouvrir sur votre ordinateur une BOM de votre entreprise et
										<strong> identifier les champs correspondant.</strong>
									</span>
								),
								number: 2,
							},
							{
								title: (
									<span>
										<strong>Créer une clef de conversion</strong> entre les deux Bill of Material
										<strong>en saisissant l&apos;intitulé du champs correspondant</strong> dans votre BOM.
									</span>
								),
								number: 3,
							},
						].map((step, index) => (
							<Card key={index} className="relative border-gray-300 p-4 shadow-sm">
								<div className="border-primary text-primary absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background3 font-semibold">
									{step.number}
								</div>
								<h3 className="mb-2 pl-2">{step.title}</h3>
							</Card>
						))}
					</div>

					<div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex gap-4">
							<Button onClick={() => setActiveStep(2)}>Compris</Button>
						</div>
					</div>

					<div className="mt-6 flex flex-col items-center justify-end gap-2 border-t border-gray-200 pt-4 sm:flex-row">
						<span className="text-sm text-muted-foreground">
							Vous avez besoin d&apos;être guidé pas à pas, vous pouvez également suivre le tutoriel :
						</span>
						<Button
							variant="outline"
							size="sm"
							className="border-primary text-primary hover:bg-primary gap-2 whitespace-nowrap hover:text-primary-foreground"
						>
							<Youtube className="h-4 w-4" />
							Regarder tutoriel
						</Button>
					</div>
				</Card>
			) : null}
			{activeStep === 2 ? <ParametreBomPage /> : null}
		</div>
	)
}
