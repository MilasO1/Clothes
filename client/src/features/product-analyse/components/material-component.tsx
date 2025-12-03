import TypeComposantIcons from "@/assets/typesComposant"

import type { ComposantType } from "@/features/composants/types"

interface MaterialComponentProps {
	name: string
	intensity: number
	compoType: ComposantType
}
export default function MaterialComponent({ name, intensity, compoType }: MaterialComponentProps) {
	const Icon = TypeComposantIcons[compoType]

	return (
		<div className="grid grid-cols-[50px_1px_1fr_1px_1fr] items-center rounded-full border bg-background3 p-1">
			{Icon && <Icon className="size-8 justify-self-center" />}

			{/* First divider column */}
			<div className="flex h-full items-center justify-center">
				<div className="h-5 w-px bg-muted-foreground/50"></div>
			</div>

			{/* Element name column */}
			<div className="pl-3">
				<span className="text-lg font-medium">{name}</span>
			</div>

			{/* Second divider column */}
			<div className="flex h-full items-center justify-center">
				<div className="h-5 w-px bg-muted-foreground/50"></div>
			</div>

			{/* Intensity indicators column */}
			<div className="px-4">
				<div className="flex space-x-1">
					{Array.from({ length: intensity }).map((_, index) => (
						<div key={index} className="bg-primary size-3 rounded-full"></div>
					))}
					{Array.from({ length: 4 - intensity }).map((_, index) => (
						<div key={index} className="bg-white/80 size-3 rounded-full border border-gray-300"></div>
					))}
				</div>
			</div>
		</div>
	)
}
