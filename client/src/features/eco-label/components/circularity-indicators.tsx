import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { IndicatorItem } from "./indicator-item"

const indicators = [
	{
		title: "Démontabilité",
		description:
			"Evalue la capacité à séparer les différents composants du produit pour effectuer des réparations ou le recycler.",
	},
	{
		title: "Biodégradabilité",
		description: "Evalue la capacité d'un produit à se dégrader dans l'environnement sans l'impacter négativement.",
	},
	{
		title: "Recyclabilité produit boucle fermée",
		description: "Evalue la capacité à recycler un produit en boucle fermée (ex: du textile au textile).",
	},
	{
		title: "Recyclabilité produit boucle ouverte",
		description: "Evalue la capacité à recycler un produit en boucle ouverte (ex: d'un textile vers de l'isolant).",
	},
]

export function CircularityIndicators() {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="circularity-indicators" className="border-none">
				<Card className="rounded-md p-6 shadow-none">
					<AccordionTrigger className="flex w-full justify-between">
						<h2 className="text-primary text-xl font-medium">Indicateurs de circularité</h2>
					</AccordionTrigger>

					<AccordionContent>
						<Separator className="my-4" />
						<div className="space-y-4">
							{indicators.map((indicator, index) => (
								<IndicatorItem key={index} title={indicator.title} description={indicator.description} />
							))}
						</div>
					</AccordionContent>
				</Card>
			</AccordionItem>
		</Accordion>
	)
}
