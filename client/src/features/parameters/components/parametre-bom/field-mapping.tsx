import { HelpCircle } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FieldMappingProps {
	helpText?: string
	value: string
	error?: boolean
	onChange: (value: string) => void
	inputValue: string
}

export function FieldMapping({ helpText, value, error, onChange, inputValue }: FieldMappingProps) {
	return (
		<div className="w-full overflow-hidden">
			<div className="flex w-full items-center gap-4">
				<div
					className={`flex min-h-[38px] flex-1 items-center rounded-md border bg-white px-3 py-2 text-sm transition-colors ${error ? "border-red-500" : "border-gray-200"}`}
				>
					<span>{value}</span>
					{helpText && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<button className="ml-2 focus:outline-none">
										<HelpCircle className="h-4 w-4 text-gray-400" />
									</button>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-sm">{helpText}</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
				</div>
				<div className="flex flex-shrink-0 justify-center self-center">
					<svg width="24" height="8" viewBox="0 0 24 8" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M0 4H22M22 4L19 1M22 4L19 7" stroke="#D1D5DB" strokeWidth="1.5" />
					</svg>
				</div>
				<Input
					value={inputValue}
					onChange={e => onChange(e.target.value)}
					placeholder="Ecrire le champ équivalent"
					className={`flex-1 border bg-white transition-colors focus:border-transparent focus:ring-2 focus:ring-[#006D77] ${error ? "border-red-500" : "border-gray-200"}`}
				/>
			</div>
		</div>
	)
}
