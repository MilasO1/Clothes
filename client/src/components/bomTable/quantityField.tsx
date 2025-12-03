import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { getCompatible } from "@/features/produits/business"
import type { Composition } from "@/features/produits/types"

export default function QuantityField({
	composi,
	readonly = false,
	onUpdate = undefined,
}: {
	composi: Composition
	readonly?: boolean
	onUpdate?: any
}) {
	if (readonly) {
		return (
			<div>
				{composi.nombre} {composi.unite}
			</div>
		)
	}

	const compatibleUnits = getCompatible(composi.unite)

	return (
		<>
			<Input
				type="number"
				step="any"
				inputMode="decimal"
				min={0}
				placeholder="Nombre"
				className="w-24 mr-2 text-end [appearance:textfield]
					[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				defaultValue={composi.nombre}
				onChange={evt => onUpdate(composi.composantId, { nombre: evt.target.valueAsNumber })}
			/>

			<Select value={composi.unite} onValueChange={unite => onUpdate(composi.composantId, { unite })}>
				<SelectTrigger className="w-28">
					<SelectValue placeholder="Unité" />
				</SelectTrigger>
				<SelectContent>
					{compatibleUnits.map(unit => (
						<SelectItem key={unit} value={unit}>
							{unit}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	)
}
