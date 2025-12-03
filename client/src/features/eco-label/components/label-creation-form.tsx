import { useState } from "react"

import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

import { LevelCard } from "./level-card"

interface LabelCreationFormProps {
	onCancel: () => void
}

export function LabelCreationForm({ onCancel }: LabelCreationFormProps) {
	const [wantCustomName, setWantCustomName] = useState("non")
	const [levelCount, setLevelCount] = useState("2")

	return (
		<Card className="p-6">
			<h2 className="text-primary mb-4 text-xl font-medium">Paramétrage de l&apos;éco label Darwie</h2>
			<Separator className="mb-6" />

			<div className="space-y-6">
				<div>
					<div className="mb-2 font-medium">Donner un nom au &quot;label éco conception interne&quot;:</div>
					<div className="mb-3 text-sm text-gray-500">Il sera nommé par défaut: &quot;éco-label interne&quot;</div>
					<RadioGroup
						defaultValue="non"
						className="flex gap-8"
						value={wantCustomName}
						onValueChange={setWantCustomName}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="non" id="non" />
							<Label htmlFor="non">Non</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="oui" id="oui" />
							<Label htmlFor="oui">Oui</Label>
						</div>
					</RadioGroup>

					{wantCustomName === "oui" && (
						<div className="mt-4">
							<div className="mb-2">
								Nom éco label <span className="text-red-500">*</span>
							</div>
							<Input placeholder="Exemple : Brand eco design rules" className="max-w-xl" />
						</div>
					)}
				</div>

				<div>
					<div className="mb-2 font-medium">
						Combien de niveaux/ paliers d&apos;éco-conception souhaitez vous définir pour votre entreprise?
					</div>
					<RadioGroup defaultValue="2" className="flex gap-8" value={levelCount} onValueChange={setLevelCount}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="2" id="deux" />
							<Label htmlFor="deux">2 niveaux</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="3" id="trois" />
							<Label htmlFor="trois">3 niveaux</Label>
						</div>
					</RadioGroup>
				</div>

				<div className={levelCount === "2" ? "flex justify-center gap-6" : "flex justify-between gap-4"}>
					<LevelCard level="1" description="Pas eco conçu" placeholder="Standard" />

					<LevelCard level="2" description="Respecte les critères d'éco conception" placeholder="Eco" />

					{levelCount === "3" && <LevelCard level="3" description="Eco conception avancée" placeholder="Eco+" />}
				</div>

				<div className="bg-accent flex items-center gap-2 rounded-md p-4">
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600">
						<Info className="h-4 w-4" />
					</div>
					<div>Tous les produits par défaut auront à minima le niveau 1</div>
				</div>

				<div className="mt-4 flex justify-end gap-4">
					<Button variant="outline" onClick={onCancel}>
						Annuler
					</Button>
					<Button className="bg-primary/80 hover:bg-primary text-white">Continuer</Button>
				</div>
			</div>
		</Card>
	)
}
