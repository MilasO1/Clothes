import { useState } from "react"

import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"

import { cn } from "@/components/utils"

interface MaterialData {
	name: string
	value: number
	color: string
}

interface MaterialDistributionChartProps {
	title?: string
	data: MaterialData[]
	className?: string
}

export default function MaterialDistributionChart({ title, data, className }: MaterialDistributionChartProps) {
	const [activeIndex, setActiveIndex] = useState<number | null>(null)

	// Calculate total for percentage calculation
	const total = data.reduce((acc, item) => acc + item.value, 0)

	// Format data for the chart
	const chartData = data.map(item => ({
		...item,
		percentage: ((item.value / total) * 100).toFixed(1),
	}))

	// Custom active shape for pie
	const renderActiveShape = (props: any) => {
		const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props

		return (
			<g>
				<text x={cx} y={cy} dy={0} textAnchor="middle" fill="hsl(188 100% 30%)" fontSize={22} fontWeight={500}>
					{`${(percent * 100).toFixed(1)}%`}
				</text>
				<text x={cx} y={cy} dy={15} textAnchor="middle" fill="#777" fontSize={14}>
					{payload.name}
				</text>
				<Sector
					cx={cx}
					cy={cy}
					innerRadius={innerRadius}
					outerRadius={outerRadius + 5}
					startAngle={startAngle}
					endAngle={endAngle}
					fill={fill}
				/>
			</g>
		)
	}

	return (
		<div className={cn("fxc-center card-shape justify-between max-w-md", className)}>
			<h2 className="text-primary text-xl font-bold mb-6">{title}</h2>

			<div className="flex">
				<ResponsiveContainer className="w-2/3" width="100%" aspect={1}>
					<PieChart>
						<Pie
							activeIndex={activeIndex !== null ? activeIndex : undefined}
							activeShape={renderActiveShape}
							data={chartData}
							cx="50%"
							cy="50%"
							innerRadius={50}
							outerRadius={80}
							paddingAngle={2}
							dataKey="value"
							onMouseEnter={(_, index) => setActiveIndex(index)}
							onMouseLeave={() => setActiveIndex(null)}
						>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>

				<div className="flex w-1/3 flex-col justify-center">
					{chartData.map((item, index) => (
						<div
							key={index}
							className={cn("flex items-center gap-3 rounded-md p-2 transition-all")}
							onMouseEnter={() => setActiveIndex(index)}
							onMouseLeave={() => setActiveIndex(null)}
						>
							<div className="min-h-6 min-w-6" style={{ backgroundColor: item.color }} />
							<div className="flex flex-col">
								<span className="font-medium">{item.name}</span>
								<span className="text-sm text-muted-foreground">{item.percentage}%</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
