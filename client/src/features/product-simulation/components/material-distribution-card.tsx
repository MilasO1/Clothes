import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent } from "@/components/ui/card"

// Custom tooltip for the pie charts
const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded border bg-white p-2 shadow-sm">
				<p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
			</div>
		)
	}
	return null
}

interface MaterialItem {
	name: string
	value: number
	color: string
}

interface MaterialDistributionCardProps {
	materials: MaterialItem[]
	isSimulation?: boolean
}

export default function MaterialDistributionCard({ materials }: MaterialDistributionCardProps) {
	// Calculate "Autres matières" if total is less than 100%
	const totalPercentage = materials.reduce((sum, item) => sum + item.value, 0)
	const pieData = [...materials]

	if (totalPercentage < 100) {
		pieData.push({
			name: "Autres matières",
			value: 100 - totalPercentage,
			color: "#D9D9D9",
		})
	}

	return (
		<Card className="overflow-hidden rounded-md shadow-none">
			<CardContent className="flex flex-col items-center p-6">
				<div className="relative h-[250px] w-[250px]">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={pieData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={90}
								fill="#8884d8"
								paddingAngle={0}
								dataKey="value"
							>
								{pieData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip content={<CustomPieTooltip />} />
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-4 flex flex-col gap-2">
					{pieData.map((material, index) => (
						<div key={index} className="flex items-center gap-2">
							<div className="h-3 w-3 rounded-full" style={{ backgroundColor: material.color }}></div>
							<span className="text-sm">{material.name}</span>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
