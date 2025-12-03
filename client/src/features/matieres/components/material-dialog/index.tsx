import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import MaterialDialogForm from "./material-dialog-form"

interface MaterialDialogProps {
	isOpen: boolean
	resource?: any
	onClose: () => void
}

export default function MaterialDialog({ isOpen, resource: material, onClose }: MaterialDialogProps) {
	const isEditMode = !!material
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="p-0 sm:max-w-[900px] max-h-11/12 overflow-y-auto scrollbar-hide">
				<DialogHeader className="inset-x-0 top-0 z-10 rounded-t-md border-b bg-background2 px-6">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-primary text-xl font-bold py-4">
							{isEditMode ? material?.nom : "Créer une matière personnalisée"}{" "}
						</DialogTitle>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="size-6" />
						</Button>
					</div>
					<DialogDescription className="sr-only">Creation</DialogDescription>
				</DialogHeader>

				<MaterialDialogForm material={material} onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
}
