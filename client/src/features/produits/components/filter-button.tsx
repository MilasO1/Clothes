import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type * as ReactAlias from "react"

import { Check, ChevronLeft, ChevronRight, Filter, Plus, Search, X } from "lucide-react"

import { cn } from "@/components/utils"

import { useIsMobile } from "@/components/use-mobile"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TooltipProvider } from "@/components/ui/tooltip"

type FilterOption = {
	id: string
	label: string
	count?: number // Optional count of items for each filter option
}

type FilterCategory = {
	id: string
	name: string
	options: FilterOption[]
}

// Storage key for persisting filters
const STORAGE_KEY = "filter-selections"

// Maximum number of filter tags to show in the button before collapsing
const MAX_VISIBLE_TAGS = 3

// Custom filter tag component with working delete button
const FilterTag = ({
	category,
	option,
	resetSingleFilter,
}: {
	category: FilterCategory
	option: FilterOption
	resetSingleFilter: (
		categoryName: string,
		optionId: string,
		event?: ReactAlias.MouseEvent<Element, MouseEvent> | undefined
	) => void
}) => {
	return (
		<div className={cn("flex items-center gap-1 rounded px-2 py-0.5 bg-secondary/90 text-primary-foreground")}>
			<span className="truncate">{option.label}</span>
			<button
				type="button"
				onClick={e => {
					e.stopPropagation()
					resetSingleFilter(category.name, option.id)
				}}
				className="ml-1 rounded-full hover:bg-accent"
				aria-label={`Remove ${option.label} filter`}
			>
				<X className="h-3 w-3" />
			</button>
		</div>
	)
}

export default function FilterButton() {
	const [isOpen, setIsOpen] = useState(false)
	const [activeCategory, setActiveCategory] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
		"Product category": ["Robe"],
	})
	const [isAnimating, setIsAnimating] = useState(false)
	const [showAllTags, setShowAllTags] = useState(false)

	// Refs for click handling
	const dropdownRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)

	// Check if screen is mobile
	const isMobile = useIsMobile()

	// Define filter categories with colors
	const filterCategories: FilterCategory[] = useMemo(
		() => [
			{
				id: "all",
				name: "Tous les produits",
				options: [{ id: "all-products", label: "Tous les produits", count: 120 }],
			},
			{
				id: "gender",
				name: "Genre",
				options: [
					{ id: "male", label: "Homme", count: 42 },
					{ id: "female", label: "Femme", count: 56 },
					{ id: "unisex", label: "Unisexe", count: 22 },
				],
			},
			{
				id: "status",
				name: "Statut de traitement",
				options: [
					{ id: "in-stock", label: "En stock", count: 89 },
					{ id: "out-of-stock", label: "Rupture de stock", count: 12 },
					{ id: "pre-order", label: "Précommande", count: 19 },
				],
			},
			{
				id: "product",
				name: "Catégorie de produit",
				options: [
					{ id: "bonnet", label: "Bonnet", count: 15 },
					{ id: "echarpe", label: "Écharpe", count: 8 },
					{ id: "serviette", label: "Serviette", count: 12 },
					{ id: "robe", label: "Robe", count: 24 },
					{ id: "combinaison", label: "Combinaison", count: 6 },
					{ id: "jupe", label: "Jupe", count: 18 },
					{ id: "chaussettes", label: "Chaussettes", count: 9 },
					{ id: "veste", label: "Veste", count: 14 },
				],
			},
			{
				id: "year",
				name: "Année d'émission",
				options: [
					{ id: "2023", label: "2023", count: 45 },
					{ id: "2022", label: "2022", count: 38 },
					{ id: "2021", label: "2021", count: 27 },
					{ id: "2020", label: "2020", count: 10 },
				],
			},
			{
				id: "care",
				name: "Étiquette d'entretien",
				options: [
					{ id: "organic", label: "Bio", count: 32 },
					{ id: "eco-friendly", label: "Écologique", count: 28 },
					{ id: "recycled", label: "Recyclé", count: 15 },
					{ id: "sustainable", label: "Durable", count: 22 },
				],
			},
			{
				id: "category",
				name: "Catégorie",
				options: [
					{ id: "new-arrival", label: "Nouveauté", count: 18 },
					{ id: "bestseller", label: "Meilleures ventes", count: 24 },
					{ id: "sale", label: "Soldes", count: 36 },
					{ id: "limited-edition", label: "Édition limitée", count: 8 },
				],
			},
		],
		[]
	)

	// Handle clicks outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				isOpen &&
				dropdownRef.current &&
				buttonRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen])

	// Load filters from localStorage on component mount
	useEffect(() => {
		const savedFilters = localStorage.getItem(STORAGE_KEY)
		if (savedFilters) {
			try {
				const parsedFilters = JSON.parse(savedFilters)
				setSelectedFilters(parsedFilters)
			} catch (error) {
				console.error("Failed to parse saved filters:", error)
			}
		}
	}, [])

	// Save filters to localStorage whenever they change
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFilters))
	}, [selectedFilters])

	// Count total selected filters - memoized for performance
	const totalSelectedFilters = useMemo(() => {
		return Object.values(selectedFilters || {}).reduce((count, filters) => count + filters.length, 0)
	}, [selectedFilters])

	// Get all selected filter options with their details - memoized for performance
	const selectedFilterDetails = useMemo(() => {
		const details: { category: FilterCategory; option: FilterOption }[] = []

		filterCategories.forEach(category => {
			const selectedIds = selectedFilters[category.name] || []
			selectedIds.forEach(id => {
				const option = category.options.find(opt => opt.id === id)
				if (option) {
					details.push({ category, option })
				}
			})
		})

		return details
	}, [filterCategories, selectedFilters])

	// Group selected filters by category for better organization
	const selectedFiltersByCategory = useMemo(() => {
		const grouped: Record<string, { category: FilterCategory; options: FilterOption[] }> = {}

		selectedFilterDetails.forEach(({ category, option }) => {
			if (!grouped[category.name]) {
				grouped[category.name] = {
					category,
					options: [],
				}
			}
			grouped[category.name].options.push(option)
		})

		return Object.values(grouped)
	}, [selectedFilterDetails])

	// Get selected options for a specific category
	const getSelectedOptionsForCategory = useCallback(
		(category: FilterCategory) => {
			const selectedIds = selectedFilters[category.name] || []
			return category.options.filter(option => selectedIds.includes(option.id))
		},
		[selectedFilters]
	)

	const openCategoryDetail = useCallback((categoryId: string) => {
		setIsAnimating(true)
		setTimeout(() => {
			setActiveCategory(categoryId)
			setSearchQuery("")
			setIsAnimating(false)
		}, 150)
	}, [])

	const backToMainMenu = useCallback(() => {
		setIsAnimating(true)
		setTimeout(() => {
			setActiveCategory(null)
			setSearchQuery("")
			setIsAnimating(false)
		}, 150)
	}, [])

	const isOptionSelected = useCallback(
		(categoryName: string, optionId: string) => {
			return selectedFilters[categoryName]?.includes(optionId) || false
		},
		[selectedFilters]
	)

	const toggleFilterOption = useCallback((categoryName: string, optionId: string, event?: ReactAlias.MouseEvent) => {
		if (event) {
			event.stopPropagation()
		}

		setSelectedFilters(prev => {
			const currentFilters = prev[categoryName] || []

			if (currentFilters.includes(optionId)) {
				// Remove the filter if already selected
				const updatedFilters = currentFilters.filter(id => id !== optionId)
				return {
					...prev,
					[categoryName]: updatedFilters.length ? updatedFilters : [],
				}
			} else {
				// Add the filter if not selected
				return {
					...prev,
					[categoryName]: [...currentFilters, optionId],
				}
			}
		})
	}, [])

	const toggleSelectAll = useCallback(
		(categoryName: string, options: FilterOption[]) => {
			const currentFilters = selectedFilters[categoryName] || []

			// If all options are already selected, deselect all
			if (options.every(option => currentFilters.includes(option.id))) {
				setSelectedFilters(prev => ({
					...prev,
					[categoryName]: [],
				}))
			} else {
				// Otherwise, select all options
				setSelectedFilters(prev => ({
					...prev,
					[categoryName]: options.map(option => option.id),
				}))
			}
		},
		[selectedFilters]
	)

	const getActiveCategoryName = useCallback(() => {
		const category = filterCategories.find(cat => cat.id === activeCategory)
		return category?.name
	}, [activeCategory, filterCategories])

	const resetFilters = useCallback(() => {
		if (activeCategory) {
			// Reset only the active category
			setSelectedFilters(prev => ({
				...prev,
				[getActiveCategoryName() || ""]: [],
			}))
		} else {
			// Reset all filters
			setSelectedFilters({})
		}
	}, [activeCategory, getActiveCategoryName])

	const resetCategoryFilters = useCallback((categoryName: string, event?: ReactAlias.MouseEvent) => {
		if (event) {
			event.stopPropagation()
		}

		setSelectedFilters(prev => ({
			...prev,
			[categoryName]: [],
		}))
	}, [])

	const resetSingleFilter = useCallback((categoryName: string, optionId: string, event?: ReactAlias.MouseEvent) => {
		if (event) {
			event.stopPropagation()
		}

		setSelectedFilters(prev => {
			const currentFilters = prev[categoryName] || []
			const updatedFilters = currentFilters.filter(id => id !== optionId)

			return {
				...prev,
				[categoryName]: updatedFilters.length ? updatedFilters : [],
			}
		})
	}, [])

	const applyFilters = useCallback(() => {
		setIsOpen(false)
		setActiveCategory(null)
		setShowAllTags(false)
		// Here you would typically apply the filters to your data
		console.log("Applying filters:", selectedFilters)
	}, [selectedFilters])

	const getFilteredOptions = useCallback(
		(options: FilterOption[]) => {
			if (!searchQuery) return options
			return options.filter(option => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
		},
		[searchQuery]
	)

	// Determine which tags to show in the main button
	const visibleTags = useMemo(() => {
		if (showAllTags) return selectedFilterDetails

		// On mobile, show even fewer tags
		const limit = isMobile ? 1 : MAX_VISIBLE_TAGS
		return selectedFilterDetails.slice(0, limit)
	}, [selectedFilterDetails, showAllTags, isMobile])

	// Count of hidden tags
	const hiddenTagsCount = useMemo(() => {
		if (showAllTags) return 0
		return Math.max(0, selectedFilterDetails.length - visibleTags.length)
	}, [selectedFilterDetails.length, visibleTags.length, showAllTags])

	// Toggle the dropdown
	const toggleDropdown = useCallback((e: ReactAlias.MouseEvent) => {
		e.stopPropagation()
		setIsOpen(prev => !prev)
	}, [])

	const renderMainMenu = () => (
		<>
			<div className="sticky top-0 z-10 flex items-center justify-between rounded-t-md border-b bg-background2 p-4">
				<h3 className="font-medium">Filtres</h3>
				{totalSelectedFilters > 0 && (
					<Button
						variant="ghost"
						className="flex h-auto items-center gap-1 p-0 text-sm text-muted-foreground hover:text-foreground"
						onClick={resetFilters}
					>
						<X className="h-3 w-3" />
						Réinitialiser
					</Button>
				)}
			</div>

			<div className="max-h-[400px] overflow-y-auto">
				{filterCategories.map(category => {
					const selectedOptions = getSelectedOptionsForCategory(category)

					return (
						<div
							key={category.id}
							className="flex w-full cursor-pointer items-center justify-between border-b p-4 text-left transition-colors hover:bg-accent"
							onClick={() => openCategoryDetail(category.id)}
						>
							<span className="text-foreground">{category.name}</span>
							<div className="flex items-center">
								{selectedOptions.length > 0 && (
									<div className="mr-2 flex max-w-[150px] flex-wrap justify-end gap-1">
										{selectedOptions.length > 2 ? (
											<span
												className={cn(
													"flex items-center gap-1 rounded px-2 py-1 text-xs bg-secondary/90 text-primary-foreground"
												)}
											>
												{selectedOptions.length} sélectionnés
												<button
													onClick={e => resetCategoryFilters(category.name, e)}
													className="ml-1 rounded-full hover:bg-accent"
													aria-label={`Remove all ${category.name} filters`}
												>
													<X className="h-3 w-3" />
												</button>
											</span>
										) : (
											selectedOptions.map(option => (
												<span
													key={option.id}
													className={cn(
														"flex items-center gap-1 rounded px-2 py-1 text-xs bg-secondary/90 text-primary-foreground"
													)}
												>
													{option.label}
													<button
														onClick={e => resetSingleFilter(category.name, option.id, e)}
														className="ml-1 rounded-full hover:bg-accent"
														aria-label={`Remove ${option.label} filter`}
													>
														<X className="h-3 w-3" />
													</button>
												</span>
											))
										)}
									</div>
								)}
								<ChevronRight className="ml-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
							</div>
						</div>
					)
				})}
			</div>
		</>
	)

	const renderCategoryDetail = () => {
		const category = filterCategories.find(cat => cat.id === activeCategory)
		if (!category) return null

		const filteredOptions = getFilteredOptions(category.options)
		const allSelected =
			category.options.length > 0 &&
			category.options.every(option => selectedFilters[category.name]?.includes(option.id))

		return (
			<>
				<div className="sticky top-0 z-10 flex items-center justify-between rounded-t-md border-b bg-background2 p-4">
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="sm"
							className="mr-2 flex h-7 w-7 items-center justify-center rounded-full p-0 hover:bg-accent"
							onClick={backToMainMenu}
							aria-label="Back to filter categories"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<h3 className="font-medium">{category.name}</h3>
					</div>
					<Button
						variant="ghost"
						className="flex h-auto items-center gap-1 p-0 text-sm text-muted-foreground hover:text-foreground"
						onClick={resetFilters}
						disabled={!selectedFilters[category.name]?.length}
					>
						<X className="h-3 w-3" />
						Réinitialiser
					</Button>
				</div>

				<div className="sticky top-[57px] z-10 border-b bg-background2 p-4">
					<div className="relative">
						<Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Rechercher"
							className="pl-8"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<Button
								variant="ghost"
								size="sm"
								className="absolute top-1 right-1 h-7 w-7 p-1"
								onClick={() => setSearchQuery("")}
								aria-label="Clear search"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				<ScrollArea className="h-[300px]">
					{category.options.length > 0 && (
						<div
							className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent"
							onClick={() => toggleSelectAll(category.name, category.options)}
						>
							<span className="font-medium">Tout sélectionner</span>
							{allSelected && <Check className="h-4 w-4" />}
						</div>
					)}

					{filteredOptions.length > 0 ? (
						filteredOptions.map(option => (
							<div
								key={option.id}
								className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-accent"
								onClick={() => toggleFilterOption(category.name, option.id)}
							>
								<span className="text-foreground">{option.label}</span>
								<div className="flex items-center gap-2">
									{option.count !== undefined && (
										<span className="text-xs text-muted-foreground">({option.count})</span>
									)}
									{isOptionSelected(category.name, option.id) && <Check className="h-4 w-4" />}
								</div>
							</div>
						))
					) : (
						<div className="p-4 text-center text-muted-foreground">No results found</div>
					)}
				</ScrollArea>
			</>
		)
	}

	// Render the filter summary popover content
	const renderFilterSummary = () => (
		<div className="max-h-[400px] w-[300px] overflow-y-auto p-4">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="text-sm font-medium">Filtres actifs</h3>
				<Button variant="ghost" size="sm" onClick={resetFilters}>
					Tout effacer
				</Button>
			</div>

			{selectedFiltersByCategory.length > 0 ? (
				<div className="space-y-3">
					{selectedFiltersByCategory.map(({ category, options }) => (
						<div key={category.id} className="space-y-1 px-2">
							<div className="flex items-center justify-between">
								<h4 className="text-xs font-medium">{category.name}</h4>
								<Button
									variant="ghost"
									size="sm"
									className="h-6 p-1 text-xs"
									onClick={e => resetCategoryFilters(category.name, e)}
								>
									<X className="h-3 w-3" />
									Effacer
								</Button>
							</div>
							<div className="flex flex-wrap gap-1">
								{options.map(option => (
									<Badge
										key={option.id}
										variant="outline"
										className={cn(
											"flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary/90 text-primary-foreground"
										)}
									>
										{option.label}
										<button
											onClick={e => resetSingleFilter(category.name, option.id, e)}
											className="rounded-full hover:bg-accent"
											aria-label={`Remove ${option.label} filter`}
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="py-4 text-center text-sm text-muted-foreground">Aucun filtre actif</div>
			)}
		</div>
	)

	return (
		<TooltipProvider>
			<div className="relative">
				{/* Custom filter button */}
				<button
					ref={buttonRef}
					type="button"
					onClick={toggleDropdown}
					className={cn(
						"border border-gray-500/15 bg-background2 px-4 py-2 text-foreground hover:bg-background3",
						"relative flex min-h-10 items-center gap-2 rounded-md",
						isMobile ? "max-w-[90vw]" : "max-w-800px]"
					)}
				>
					<div className="flex shrink-0 items-center">
						<Filter className="mr-2 h-4 w-4" />
						<span>Filtres</span>
					</div>

					{selectedFilterDetails.length > 0 && (
						<div className="flex flex-wrap items-center gap-1 overflow-hidden">
							{visibleTags.map(({ category, option }) => (
								<FilterTag
									key={`${category.id}-${option.id}`}
									category={category}
									option={option}
									resetSingleFilter={resetSingleFilter}
								/>
							))}

							{hiddenTagsCount > 0 && (
								<Popover>
									<PopoverTrigger asChild>
										<div
											onClick={e => e.stopPropagation()}
											className="flex cursor-pointer items-center rounded border border-border bg-accent px-2 py-0.5"
										>
											<Plus className="mr-1 h-3 w-3" />
											{hiddenTagsCount} more
										</div>
									</PopoverTrigger>
									<PopoverContent className="p-0" align="start">
										{renderFilterSummary()}
									</PopoverContent>
								</Popover>
							)}
						</div>
					)}
				</button>

				{/* Custom dropdown */}
				{isOpen && (
					<div
						ref={dropdownRef}
						className={cn(
							"absolute z-50 mt-1 w-80 rounded-md border border-border bg-background shadow-md",
							isAnimating && "opacity-0 transition-opacity duration-150"
						)}
					>
						{activeCategory ? renderCategoryDetail() : renderMainMenu()}

						<div className="sticky bottom-0 flex items-center justify-between rounded-b-md border-t bg-background2 p-4">
							<div className="text-sm text-gray-500">
								{totalSelectedFilters} {totalSelectedFilters === 1 ? "filtre sélectionné" : "filtres sélectionnés"}
							</div>
							<Button
								onClick={applyFilters}
								className="bg-primary text-primary-foreground hover:bg-primary/90"
								disabled={totalSelectedFilters === 0}
							>
								Appliquer
							</Button>
						</div>
					</div>
				)}
			</div>
		</TooltipProvider>
	)
}
