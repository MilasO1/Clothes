import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Blend, Box, Leaf, Shirt } from "lucide-react"
import z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ComposantsManagement from "@/features/composants/components/composantsManagement"
import BaseMaterialsManagement from "@/features/matieres/components/baseMaterialsManagement"
import MixMaterialsManagement from "@/features/matieres/components/mixMaterialsManagement"
import ProduitsManagement from "@/features/produits/components/produitsManagement"

import { queryClient } from "@/contexts/queryProvider.js"
import { listComposantsQueryOptions, listProduitsQueryOptions } from "@/contexts/apiQueries.js"

const resourcesSearchSchema = z.object({
	matId: z.string().optional(),
})

export const Route = createFileRoute("/_dashboard/resources/")({
	component: ResourcesPage,
	validateSearch: resourcesSearchSchema,
})

const tabsData = {
	baseMat: {
		label: "Matières de base",
		icon: Leaf,
		view: BaseMaterialsManagement,
		prefetch: undefined,
	},
	mixMat: {
		label: "Matières personnalisées",
		icon: Blend,
		view: MixMaterialsManagement,
		prefetch: undefined,
	},
	comp: {
		label: "Composants",
		icon: Box,
		view: ComposantsManagement,
		prefetch: () => queryClient.prefetchQuery(listComposantsQueryOptions),
	},
	prod: {
		label: "Produits",
		icon: Shirt,
		view: ProduitsManagement,
		prefetch: () => queryClient.prefetchQuery(listProduitsQueryOptions),
	},
}

function ResourcesPage() {
	const [activeTab, setActiveTab] = useState<"baseMat" | "mixMat" | "comp" | "prod">("baseMat")

	return (
		<div className="container mx-auto px-4 py-6">
			<Tabs
				defaultValue={activeTab}
				onValueChange={value => setActiveTab(value as "baseMat" | "mixMat" | "comp" | "prod")}
				className="w-full gap-4"
			>
				<TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b-2 bg-transparent p-0">
					{Object.entries(tabsData).map(([key, data]) => (
						<TabsTrigger
							value={key}
							key={key}
							className="data-[state=active]:text-primary text-foreground rounded-none data-[state=active]:rounded-t-lg px-4 py-2 text-lg font-semibold data-[state=active]:bg-gray-500/15 data-[state=active]:shadow-none"
							onMouseEnter={data.prefetch}
						>
							<data.icon className="mr-2 size-6" /> {data.label}
						</TabsTrigger>
					))}
				</TabsList>

				{Object.entries(tabsData).map(([key, data]) => (
					<TabsContent value={key} key={key}>
						<data.view />
					</TabsContent>
				))}
			</Tabs>
		</div>
	)
}
