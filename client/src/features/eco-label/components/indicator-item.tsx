interface IndicatorItemProps {
	title: string
	description: string
}

export function IndicatorItem({ title, description }: IndicatorItemProps) {
	return (
		<div className="flex overflow-hidden rounded-md border">
			<div className="bg-accent text-secondary flex w-1/4 items-center justify-center p-4 text-center font-semibold">
				{title}
			</div>
			<div className="w-3/4 p-4">{description}</div>
		</div>
	)
}
