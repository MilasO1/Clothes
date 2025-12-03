import * as React from "react"

import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface CSVTableProps {
	data: string[][]
}

export function CSVTable({ data }: CSVTableProps) {
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = React.useState({})

	const columns: ColumnDef<string[]>[] = React.useMemo(
		() =>
			data[0].map((header, index) => ({
				id: index.toString(),
				accessorKey: index.toString(),
				header: ({ column }) => {
					const isFiltered = column.getFilterValue() !== undefined && column.getFilterValue() !== ""
					return (
						<div className="flex items-center justify-between space-x-2">
							<div className="flex items-center">
								<Button
									variant="ghost"
									onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
									className="p-0 font-bold hover:bg-transparent hover:text-[#006D77]"
								>
									{header}
									<ArrowUpDown className="ml-2 h-4 w-4" />
								</Button>
								{isFiltered && (
									<Badge variant="secondary" className="ml-2">
										Filtré
									</Badge>
								)}
							</div>
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
										<Filter className={`h-4 w-4 ${isFiltered ? "text-[#006D77]" : "text-gray-500"}`} />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-0" align="end">
									<div className="border-b p-4">
										<h4 className="mb-2 font-medium">Filtrer {header}</h4>
										<Input
											placeholder={`Filtrer ${header}...`}
											value={(column.getFilterValue() as string) ?? ""}
											onChange={event => column.setFilterValue(event.target.value)}
											className="mb-2 max-w-sm"
										/>
									</div>
									<div className="flex justify-between p-2">
										<Button variant="ghost" onClick={() => column.setFilterValue("")} className="text-sm text-gray-500">
											Réinitialiser
										</Button>
										<Button
											onClick={() => document.body.click()} // Close the popover
											className="bg-[#006D77] text-white hover:bg-[#005961]"
										>
											Appliquer
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					)
				},
				cell: info => info.getValue(),
				enableSorting: true,
				enableHiding: true,
			})),
		[data]
	)

	const table = useReactTable({
		data: React.useMemo(() => data.slice(1), [data]),
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between text-[#006D77]">
					<span>Données du fichier CSV</span>
					<div className="flex items-center space-x-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="ml-auto">
									Colonnes <ChevronDown className="ml-2 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[200px]">
								{table
									.getAllColumns()
									.filter(column => column.getCanHide())
									.map(column => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={value => column.toggleVisibility(!!value)}
											>
												{data[0][Number.parseInt(column.id, 10)]}
											</DropdownMenuCheckboxItem>
										)
									})}
							</DropdownMenuContent>
						</DropdownMenu>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={value => {
								table.setPageSize(Number(value))
							}}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue placeholder={table.getState().pagination.pageSize} />
							</SelectTrigger>
							<SelectContent side="top">
								{[10, 20, 30, 40, 50].map(pageSize => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="overflow-hidden rounded-md border border-gray-200">
					<Table>
						<TableHeader className="bg-gray-100">
							{table.getHeaderGroups().map(headerGroup => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map(header => (
										<TableHead key={header.id} className="p-2">
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row, index) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
									>
										{row.getVisibleCells().map(cell => (
											<TableCell key={cell.id} className="p-2">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										Aucune donnée.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				<div className="flex items-center justify-between space-x-2 py-4">
					<div className="text-muted-foreground flex-1 text-sm">
						{table.getFilteredSelectedRowModel().rows.length} sur {table.getFilteredRowModel().rows.length} ligne(s)
						sélectionnée(s).
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Aller à la première page</span>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Aller à la page précédente</span>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<div className="flex items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
						</div>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Aller à la page suivante</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Aller à la dernière page</span>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
