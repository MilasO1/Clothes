interface SustainabilityGridProps {
	demontabilite?: boolean // true = Bonne, false = Mauvaise
	biodegradabilite?: boolean
	recyclabiliteFermee?: boolean
	recyclabiliteOuverte?: boolean
}

export default function SustainabilityGrid({
	demontabilite = true,
	biodegradabilite = false,
	recyclabiliteFermee = true,
	recyclabiliteOuverte = false,
}: SustainabilityGridProps) {
	const renderStatus = (title: string, isGood: boolean) => (
		<div className="fxc-center gap-4 justify-between card-shape rounded-none outline outline-muted-foreground/50">
			<div className="text-center font-medium">{title}</div>
			{isGood ? (
				<div className="bg-primary rounded-md px-4 py-1 text-primary-foreground">Bonne</div>
			) : (
				<div className="rounded-md bg-red-200/80 px-4 py-1 text-red-800">Mauvaise</div>
			)}
		</div>
	)

	return (
		<div className="card-shape p-0 grid w-[400px] grid-cols-2 overflow-hidden">
			{renderStatus("Démontabilité produit", demontabilite)}
			{renderStatus("Biodégradabilité", biodegradabilite)}
			{renderStatus("Recyclabilité boucle fermée", recyclabiliteFermee)}
			{renderStatus("Recyclabilité boucle ouverte", recyclabiliteOuverte)}
		</div>
	)
}
