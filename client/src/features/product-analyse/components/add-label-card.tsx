import { Fragment, useState } from "react"

import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import sampleImage from "@/assets/produit-tshirt.webp"

export default function AddLabelCard() {
	const [open, setOpen] = useState(false)

	const openModal = () => {
		setOpen(true)
	}

	return (
		<Fragment>
			<button
				onClick={openModal}
				className="group flex size-52 flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-muted-foreground/30 p-6 hover:shadow-sm bg-background3"
			>
				<div>
					<span className="text-muted-foreground">Aucun enregistré</span>
				</div>
				<div className="flex items-center gap-2">
					<Plus className="size-5" />
					<span className="underline">Ajouter un label</span>
				</div>
				<div>
					<span className="text-muted-foreground text-center group-hover:font-medium">Certificats matière</span>
				</div>
			</button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md md:max-w-xl lg:max-w-2xl">
					<div className="flex items-center justify-between p-6 pb-4">
						<DialogTitle className="text-primary text-xl font-medium">Label éco conception interne</DialogTitle>
					</div>

					<div className="px-6 pb-6">
						<div className="mb-6 rounded-lg bg-gray-50 p-6 shadow-sm">
							<div className="flex flex-col gap-8 md:flex-row">
								<div className="flex flex-col items-center">
									<div className="mb-2 rounded-md border border-gray-300 bg-white p-3 shadow-sm">
										<img src={sampleImage} alt="Jacket" className="h-16 w-16" width={64} height={64} />
									</div>
									<span className="mt-1 text-gray-700">test1</span>
								</div>
								<Separator orientation="vertical" className="h-full" />

								<div className="flex flex-col justify-center">
									<h3 className="mb-3 text-lg font-medium text-gray-800">Niveau éco conception</h3>
									<div className="inline-block">
										<span className="rounded-md border border-gray-300 bg-white px-5 py-2 text-gray-700 shadow-sm">
											Non attribué
										</span>
									</div>
								</div>
							</div>
						</div>

						<p className="mb-6 leading-relaxed text-gray-700">
							L&apos;éco label interne vous permet de suivre le niveau d&apos;éco conception de vos produits selon les
							critères d&apos;éco conception qui sont définis comme prioritaire par votre entreprise.
						</p>

						<p className="mb-8 leading-relaxed font-bold text-gray-800">
							Votre entreprise n&apos;a pas encore défini son éco label. Une fois qu&apos;il sera créé, vous pourrez
							évaluer votre produit ici
						</p>

						<div className="flex justify-center">
							<Button>
								<span className="flex flex-col items-center justify-center text-base">
									<span>Créer mon éco label</span>
								</span>
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</Fragment>
	)
}
