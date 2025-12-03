import { createFileRoute } from "@tanstack/react-router"
import { Lightbulb, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/_dashboard/idea-box/")({
	component: IdeaBoxPage,
})

function IdeaBoxPage() {
	return (
		<div className="mx-auto max-w-4xl space-y-6 p-6">
			<Card className="p-6">
				<CardHeader className="px-0 pt-0">
					<CardTitle className="text-primary flex items-center gap-2 text-2xl font-bold">
						<Lightbulb className="h-6 w-6" />
						CONTRIBUEZ AUX DÉVELOPPEMENTS DE DARWIE
					</CardTitle>
				</CardHeader>
				<Separator className="bg-primary/20 mb-6" />

				<CardContent className="px-0 pt-0">
					<p className="text-foreground mb-8 text-lg leading-relaxed">
						Parce que nous croyons qu&apos;une innovation produit doit être au service de ses futurs utilisateurs,
						Darwie vous permet d&apos;être acteur du développement de son logiciel d&apos;éco-conception de produits.
					</p>

					<h2 className="text-secondary mb-3 flex items-center justify-center gap-2 text-center text-xl font-medium">
						COMMENT CONTRIBUER?
					</h2>
					<Separator className="bg-secondary/20 mb-6" />

					<div className="mb-8 grid gap-6 md:grid-cols-2">
						{/* First contribution method */}
						<Card className="border-primary/20 hover:border-primary border shadow-sm transition-colors hover:shadow">
							<CardContent className="p-6">
								<div className="flex items-start gap-4">
									<div className="bg-accent border-primary text-primary flex h-12 w-12 min-w-12 flex-shrink-0 items-center justify-center rounded-lg border text-2xl font-semibold">
										1
									</div>
									<div className="space-y-2">
										<h3 className="text-primary font-medium">
											En soumettant des idées d&apos;améliorations ou d&apos;évolutions
										</h3>
										<ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
											<li>Pour répondre à un problème que vous connaissez dans votre travail quotidien</li>
											<li>Pour apporter des modifications à la solution logicielle de Darwie</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Second contribution method */}
						<Card className="border-primary/20 hover:border-primary border shadow-sm transition-colors hover:shadow">
							<CardContent className="p-6">
								<div className="flex items-start gap-4">
									<div className="bg-accent border-primary text-primary flex h-12 w-12 min-w-12 flex-shrink-0 items-center justify-center rounded-lg border text-2xl font-semibold">
										2
									</div>
									<div className="space-y-2">
										<h3 className="text-primary font-medium">
											En votant pour les propositions d&apos;améliorations d&apos;autres contributeurs
										</h3>
										<ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
											<li>
												Vous pourrez voter pour montrer votre accord ou désaccord concernant des propositions
												d&apos;autres personnes.
											</li>
											<li>Vous pourrez également commenter les idées en ligne</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="bg-accent/30 rounded-lg px-6">
						<h2 className="text-secondary mb-3 text-center text-lg font-medium">ENVIE DE CONTRIBUER?</h2>
						<Separator className="bg-secondary/20 mb-6" />

						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Button
								className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 transition-all hover:scale-105"
								size="lg"
							>
								<Lightbulb className="h-5 w-5" />
								Soumettre une idée de développement
							</Button>

							<Button
								variant="outline"
								className="border-primary text-primary hover:bg-primary/10 flex items-center gap-2 transition-all hover:scale-105"
								size="lg"
							>
								<Users className="h-5 w-5" />
								Consulter les propositions
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
