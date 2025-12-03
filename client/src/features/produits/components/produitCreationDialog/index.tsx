import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProduitCreationForm from "./produitCreationForm"

export default function ProduitDialog({ isOpen, resource, onClose }) {
	const isEditMode = !!resource
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="p-0 min-h-1/2 max-h-11/12 overflow-y-auto scrollbar-hide max-w-6xl">
				<DialogHeader className="inset-x-0 top-0 z-10 rounded-t-md border-b bg-background2 px-6">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-primary text-xl font-bold py-4">
							{isEditMode ? resource?.nom : "Créer un produit"}{" "}
						</DialogTitle>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="size-7" />
						</Button>
					</div>
					<DialogDescription className="sr-only">Creation</DialogDescription>
				</DialogHeader>

				<ProduitCreationForm resource={resource} onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
}
