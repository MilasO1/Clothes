import { useState } from "react"

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { AlertCircle, Plus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Route as ResourcesRoute } from "@/routes/_dashboard/resources"

// We could simply use the DialogTrigger instead
function CreateButton({ CreateDialog }) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="flex justify-end mb-4">
			<Button className="p-3 h-auto rounded-lg sticky right-4" onClick={() => setIsOpen(true)}>
				<Plus className="size-8" />
			</Button>
			<CreateDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</div>
	)
}

function DeleteConfirmation({ resource, deleteQuery, onOpenChange }) {
	const { mutate, isPending } = deleteQuery

	return (
		<Dialog open={!!resource?.nom} onOpenChange={onOpenChange}>
			<DialogContent aria-describedby={undefined} className="w-1/2 gap-8 justify-center text-center bg-background2">
				<DialogTitle>Confirmer la suppression</DialogTitle>

				<div className="py-4">
					<div className="text-muted-foreground text-sm">
						Êtes-vous sûr de vouloir supprimer <span className="text-foreground font-semibold">{resource?.nom}</span>
						{" ?"}
					</div>
				</div>

				<DialogFooter className="w-1/2 justify-self-center">
					<Button variant="outline" className="bg-background3" onClick={() => onOpenChange(false)} disabled={isPending}>
						Annuler
					</Button>
					<Button
						variant="destructive"
						onClick={() => {
							mutate(resource.id)
							onOpenChange(false)
						}}
						disabled={isPending}
					>
						{isPending ? "Suppression..." : "Supprimer"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export function ResourcesTable({ table, onSelect }) {
	return (
		<Table cntClass="bg-background2 overflow-hidden rounded-t-lg">
			<TableHeader className="bg-gray-500/15">
				{table?.getHeaderGroups().map(headerGroup => (
					<TableRow className="hover:bg-transparent" key={headerGroup.id}>
						{headerGroup.headers.map(header => (
							<TableHead
								key={header.id}
								className="text-foreground text-left"
								onClick={header.column.getToggleSortingHandler()}
							>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table?.getRowModel().rows?.map(row => (
					<TableRow
						className="hover:cursor-pointer"
						onClick={() => onSelect?.(row.original)}
						key={row.id}
						data-state={row.getIsSelected() && "selected"}
					>
						{row.getVisibleCells().map(cell => (
							<TableCell key={cell.id} className="b border-b">
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

export default function ResourcesManagement({
	getOneQuery,
	listQuery,
	columnsMaker,
	CreateDialog,
	deleteQuery,
	ViewDialog,
}) {
	const { data: resources, isError, refetch } = listQuery

	const [deletingRsc, setDeletingRsc] = useState()

	const reactTable = useReactTable({
		data: resources,
		columns: columnsMaker(setDeletingRsc),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	const { rscId } = useSearch({ strict: false })

	// TODO: handle loading error
	const { data: openedRsc, isLoading: isRscLoading } = getOneQuery(rscId)

	const navigate = useNavigate({ from: ResourcesRoute.fullPath })

	const handleOpen = rsc => {
		if (ViewDialog) {
			navigate({
				search: () => ({ rscId: rsc.id }),
			})
		}
	}

	const handleViewDialogClose = () =>
		navigate({
			search: () => ({}),
		})

	if (isError) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
					<AlertCircle className="text-destructive h-6 w-6" />
				</div>
				<h1 className="text-xl">Erreur de chargement</h1>
				<p>Une erreur est survenue, Veuillez réessayer.</p>
				<Button onClick={refetch} className="gap-2" variant="default">
					<RefreshCw className="h-4 w-4" />
					Réessayer
				</Button>
			</div>
		)
	}

	return (
		<>
			{CreateDialog && <CreateButton CreateDialog={CreateDialog} />}

			<ResourcesTable table={reactTable} onSelect={handleOpen} />

			{deleteQuery && (
				<DeleteConfirmation
					deleteQuery={deleteQuery}
					onOpenChange={() => setDeletingRsc(undefined)}
					resource={deletingRsc}
				/>
			)}

			{ViewDialog && (
				<ViewDialog isOpen={!!openedRsc && !isRscLoading} resource={openedRsc} onClose={handleViewDialogClose} />
			)}
		</>
	)
}
