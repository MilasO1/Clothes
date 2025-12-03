import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import ComposantDialog from "@/features/composants/components/composant-dialog"
import { ResourcesTable } from "@/components/resourcesManagement"

import { composantsColumns } from "@/features/composants/components/composants-table-columns"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

function CreateDialog() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<Button variant="link" size="lg" className="has-[>svg]:px-6 text-base " onClick={() => setIsOpen(true)}>
				<Plus className="mr-1 size-4" />
				Créer un composant
			</Button>
			<ComposantDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}

export default function CompoSelector({ avlCompos, compoType, onClose, onSelect }) {
	const isOpen = !!compoType
	const prettyType = compoType.split("-")[0] + "s"
	const reactTable = useReactTable({
		data: avlCompos,
		columns: composantsColumns(undefined, false),
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-10/12 min-h-1/2 p-0 gap-4">
				<DialogTitle className="flex items-center justify-between bg-background2 rounded-t-lg">
					<div className="text-primary text-xl font-bold px-6 py-4">Selection des {prettyType}</div>
					<CreateDialog />
					<DialogDescription className="sr-only">Selection des composants</DialogDescription>
				</DialogTitle>
				<div className="flex flex-col gap-4 px-6 pb-6">
					<ResourcesTable
						table={reactTable}
						onSelect={compo => {
							onSelect(compo)
							onClose()
						}}
						readonly={false}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
