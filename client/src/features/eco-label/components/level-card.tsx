import { Input } from "@/components/ui/input"

interface LevelCardProps {
	level: string
	description: string
	placeholder: string
}

export function LevelCard({ level, description, placeholder }: LevelCardProps) {
	return (
		<div className="w-[30%] min-w-[250px] overflow-hidden rounded-md border">
			<div className="bg-accent border-b p-4">
				<div className="font-bold">Niveau {level}</div>
				<div className="text-xs">{description}</div>
			</div>
			<div className="p-4">
				<div className="mb-2">
					Nom &quot;marketing&quot; du niveau <span className="text-red-500">*</span>
				</div>
				<Input placeholder={placeholder} />
			</div>
		</div>
	)
}
