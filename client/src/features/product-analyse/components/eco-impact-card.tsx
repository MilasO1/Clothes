import { MoveRight } from "lucide-react"

import type { Matiere } from "@/features/matieres/types"

import drapeauFrancais from "@/assets/french-flag.png"
import drapeauEurope from "@/assets/eu-flag.jpg"
import waterDropIcon from "@/assets/water-drop.svg"
import ecobalyseLogo from "@/assets/ecobalyse-logo.jpeg"

export default function EcoImpactCard({ matiere }: { matiere: Matiere }) {
	return (
		<div className="flex gap-4 w-full max-w-6xl md:flex-row">
			<div className="grid w-full grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-4 bg-background2">
				<div className="bg-background3 flex flex-col items-center justify-center border-r p-6">
					<h3 className="text-primary text-center text-lg font-medium h-1/2">ETOFFE PRINCIPALE</h3>
					<div className="flex flex-col gap-1 justify-center text-center h-1/2">
						<p>Pour 1 kg de</p>
						<p className="text-xl font-bold uppercase">{matiere.nom}</p>
					</div>
				</div>

				{/* Environmental Cost Section */}
				<div className="fxc-center border-r p-4">
					<div className="fxc-center gap-1 justify-start h-1/2">
						<img src={drapeauFrancais} alt="French Flag" width={32} height={32} className="object-cover" />
						<h3 className="text-center font-medium">Coût environnemental</h3>
					</div>
					<div className="fxc-center text-primary text-center text-2xl font-bold h-1/2">
						{matiere.coutEnv?.toFixed(0) || "?"} Pts <br />
						<div className="flex items-center justify-center">
							<span className="w-full text-center text-xs font-normal text-muted-foreground">
								(dont {matiere.complemMicrofibres?.toFixed(0) || "?"}Pts complément microfibres)
							</span>
						</div>
					</div>
				</div>

				<div className="fxc-center border-r p-4">
					<div className="fxc-center gap-1 justify-start h-1/2">
						<img src={drapeauEurope} alt="EU Flag" width={32} height={32} className="object-cover" />
						<h3 className="text-center font-medium">Score PEF</h3>
					</div>
					<p className="fxc-center text-primary text-2xl text-center font-bold h-1/2">
						{matiere.scorePEF?.toFixed(0) || "?"} μPts PEF
					</p>
				</div>

				{/* Water Consumption Section */}
				<div className="fxc-center p-4">
					<div className="fxc-center gap-1 justify-start h-1/2">
						<img src={waterDropIcon} alt="Water Drop" width={32} height={32} className="object-cover" />
						<h3 className="text-center font-medium">Consommation d&apos;eau</h3>
					</div>
					<p className="fxc-center text-primary text-2xl text-center font-bold h-1/2">
						{matiere.consoEau?.toFixed(0) || "?"} litres
						<br />
						&nbsp;
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<a
					className="fxc-center gap-2 rounded-lg border bg-background2 p-4 py-8 hover:font-semibold hover:bg-background3"
					href="https://ecobalyse.beta.gouv.fr/#/api"
				>
					<p className="text-center">Source de données</p>
					<div className="fx-center gap-2">
						<img
							src={ecobalyseLogo}
							alt="ECOBALYSE Logo"
							width={24}
							height={24}
							className="object-cover rounded-full"
						/>
						<span>ECOBALYSE</span>
					</div>
				</a>

				<div className="flex grow items-center rounded-lg border bg-background2 p-4 hover:font-semibold hover:bg-background3">
					<div className="mr-3">
						<MoveRight className="h-5 w-5 rotate-45" />
					</div>
					<p className="text-sm min-w-32">Comparer les matières</p>
				</div>
			</div>
		</div>
	)
}
