import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define the team member type
export type TeamMember = {
	id: string
	name: string
	role: string
	image: string
	accessLevel: "Viewer" | "Admin"
}

type TeamTabProps = {
	members: TeamMember[]
}

export default function TeamTab({ members }: TeamTabProps) {
	return (
		<Card className="mx-auto mt-6 max-w-3xl rounded-md shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-primary text-xl font-bold">Les membres de mon équipe</CardTitle>
				<div className="my-2 border-t border-gray-200"></div>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{members.map(member => (
						<div
							key={member.id}
							className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
						>
							<div className="flex items-center gap-4">
								<div className="relative h-16 w-16 overflow-hidden rounded-full">
									{member.image ? (
										<img src={member.image} alt={member.name} style={{ objectFit: "cover" }} />
									) : (
										<div className="flex h-full w-full items-center justify-center bg-gray-100">
											<span className="text-gray-400">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24"
													height="24"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												>
													<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
													<circle cx="12" cy="7" r="4"></circle>
												</svg>
											</span>
										</div>
									)}
								</div>
								<div>
									<h3 className="font-medium text-foreground">{member.name}</h3>
									<p className="text-sm text-muted-foreground">{member.role}</p>
								</div>
							</div>
							<Badge
								variant={member.accessLevel === "Admin" ? "default" : "outline"}
								className={
									member.accessLevel === "Admin"
										? "bg-primary text-primary-foreground"
										: "border-gray-300 text-foreground"
								}
							>
								{member.accessLevel}
							</Badge>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
