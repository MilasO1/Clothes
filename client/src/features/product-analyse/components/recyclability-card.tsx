import { Cell, Pie, PieChart } from "recharts"
import CardWithDetails from "./card-with-details"

interface RecyclabilityCardProps {
	title: string
	percentage: number
	detailTitle?: string
	className?: string
	children?: React.ReactNode
}

export default function PieChartCard({ title, percentage, detailTitle = "Détail", children }: RecyclabilityCardProps) {
	const data = [
		{ name: "Completed", value: percentage },
		{ name: "Remaining", value: 100 - percentage },
	]

	const COLORS = ["#006D77", "transparent"]

	return (
		<CardWithDetails title={title} detailTitle={detailTitle}>
			<CardWithDetails.Content>
				<div className="relative mb-4 flex h-40 w-40 items-center justify-center">
					{/* Center container with flexbox for perfect centering */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="size-28 rounded-full bg-[#B4D6D9]"></div>
					</div>

					<PieChart width={160} height={160}>
						<Pie
							data={data}
							cx={75}
							cy={75}
							startAngle={90}
							endAngle={-270}
							innerRadius={60}
							outerRadius={75}
							paddingAngle={0}
							dataKey="value"
							strokeWidth={0}
							strokeLinecap="round"
						>
							{data.map((_, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
									// @ts-expect-error - cornerRadius works in practice but is missing from type definitions
									cornerRadius={10}
								/>
							))}
						</Pie>
					</PieChart>

					{/* Percentage text */}
					<div className="absolute inset-0 flex items-center justify-center">
						<span className="text-3xl font-bold text-[#006D77]">{percentage.toFixed(0)}%</span>
					</div>
				</div>
			</CardWithDetails.Content>
			<CardWithDetails.DetailContent>{children}</CardWithDetails.DetailContent>
		</CardWithDetails>
	)
}
