import React, { createContext, useContext, useState } from "react"

import { ArrowLeft, Plus } from "lucide-react"

import { cn } from "@/components/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Create a context to share state between components
type CardWithDetailsContextType = {
	showDetail: boolean
	setShowDetail: React.Dispatch<React.SetStateAction<boolean>>
}

const CardWithDetailsContext = createContext<CardWithDetailsContextType | undefined>(undefined)

// Hook to use the context
export function useCardWithDetailsContext() {
	const context = useContext(CardWithDetailsContext)
	if (!context) {
		throw new Error("Card compound components must be used within CardWithDetails")
	}
	return context
}

interface CardWithDetailsProps {
	children: React.ReactNode
	className?: string
	title: string
	detailTitle?: string
	withDetail?: boolean
	isDangerVariant?: boolean
}

// Main component
function CardWithDetails({
	children,
	className,
	title,
	detailTitle = "Détail",
	withDetail = true,
	isDangerVariant = false,
}: CardWithDetailsProps) {
	const [showDetail, setShowDetail] = useState(false)

	return (
		<CardWithDetailsContext.Provider value={{ showDetail, setShowDetail }}>
			<Card className={cn("card-shape w-[300px]", className)}>
				<CardContent className="h-full px-0">
					<div className="fxc-center gap-2 h-full justify-between">
						<h3 className={cn("text-primary text-center text-xl font-bold", isDangerVariant && "text-destructive")}>
							{title}
						</h3>
						{/* Find and render the Content component */}
						{React.Children.map(children, child => {
							if (React.isValidElement(child) && child.type === Content) {
								return child
							}
							return null
						})}

						<Button
							variant="outline"
							className={cn(
								"rounded-full border-muted text-muted-foreground/80 p-3 bg-background3",
								(showDetail || !withDetail) && "invisible"
							)}
							size="sm"
							onClick={() => setShowDetail(true)}
						>
							<Plus className="h-3 w-3" />
							Détails
						</Button>
					</div>
				</CardContent>
			</Card>

			{showDetail && (
				<Card className="border-border bg-accent w-[350px] rounded-md border shadow-none">
					<CardContent className="p-0">
						<div className="flex items-center justify-between p-6 pb-2">
							<h4 className="text-xl font-medium text-[#646564]">{detailTitle}</h4>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowDetail(false)}
								className="size-10 p-0 text-[#646564] hover:bg-transparent hover:text-[#646564]"
							>
								<ArrowLeft className="size-8" />
								<span className="sr-only">Close</span>
							</Button>
						</div>

						<div className="mx-6 h-px bg-[#646564]" />

						<div className="p-6">
							{/* Find and render the DetailContent component */}
							{React.Children.map(children, child => {
								if (React.isValidElement(child) && child.type === DetailContent) {
									return child
								}
								return null
							})}
						</div>
					</CardContent>
				</Card>
			)}
		</CardWithDetailsContext.Provider>
	)
}

// Sub-components
interface ContentProps {
	children: React.ReactNode
}

function Content({ children }: ContentProps) {
	return <>{children}</>
}

interface DetailContentProps {
	children: React.ReactNode
}

function DetailContent({ children }: DetailContentProps) {
	return <>{children}</>
}

// Attach sub-components to the main component
CardWithDetails.Content = Content
CardWithDetails.DetailContent = DetailContent

export default CardWithDetails
