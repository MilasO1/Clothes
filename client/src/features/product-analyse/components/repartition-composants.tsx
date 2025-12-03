import type { ComposantType } from "@/features/composants/types"

interface RepartitionComposantsProps {
	repartition: Record<ComposantType, number>
}

export default function RepartitionComposants({ repartition }: RepartitionComposantsProps) {
	return (
		<div className="card-shape fxc-center justify-between overflow-hidden">
			<h2 className="text-primary text-center text-xl font-bold mb-6">Répartition des composants</h2>

			<div className="divide-y divide-muted-foreground rounded-sm bg-background3">
				{Object.entries(repartition).map(([typ, count]) => (
					<div className="flex items-center justify-between px-4 py-2" key={typ}>
						<span className="text-primary text-lg font-medium capitalize">{typ.split("-")[0] + "s"}</span>
						<div className="flex items-center">
							<div className="bg-muted-foreground mx-6 h-6 w-px"></div>
							<span className="text-primary text-3xl font-bold w-12 font-mono text-right">{count}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
