import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import ParametrageBom from "@/features/parameters/components/bom"
import ProfileTab from "@/features/parameters/components/profile-tab"
import type { TeamMember } from "@/features/parameters/components/team-table"
import TeamTab from "@/features/parameters/components/team-table"

import api from "@/contexts/apiQueries.js"

export const Route = createFileRoute("/_dashboard/parameters/")({
	component: ParametersPage,
})

function ParametersPage() {
	const { data: user } = api.me.get()
	const [activeTab, setActiveTab] = useState("profile")

	// Sample team members data
	const teamMembers: TeamMember[] = [
		{
			id: "1",
			name: "Bixente",
			role: "Founder",
			image: "", // Replace with actual path
			accessLevel: "Admin",
		},
		{
			id: "2",
			name: "Georges",
			role: "CTO",
			image: "", // Empty string for placeholder
			accessLevel: "Admin",
		},
	]

	return (
		<div className="container mx-auto px-4 py-6">
			<Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b bg-transparent p-0">
					<TabsTrigger
						value="profile"
						className="data-[state=active]:text-secondary text-foreground/70 rounded-none data-[state=active]:rounded-t-lg px-4 py-2 font-semibold data-[state=active]:bg-gray-500/15 data-[state=active]:shadow-none"
					>
						Mon profil
					</TabsTrigger>
					<TabsTrigger
						value="team"
						className="data-[state=active]:text-secondary text-foreground/70 rounded-none data-[state=active]:rounded-t-lg px-4 py-2 font-semibold data-[state=active]:bg-gray-500/15 data-[state=active]:shadow-none"
					>
						Equipe
					</TabsTrigger>
					<TabsTrigger
						value="billing"
						className="data-[state=active]:text-secondary text-foreground/70 rounded-none data-[state=active]:rounded-t-lg px-4 py-2 font-semibold data-[state=active]:bg-gray-500/15 data-[state=active]:shadow-none"
						disabled
					>
						Facturation
					</TabsTrigger>
					<TabsTrigger
						value="import"
						className="data-[state=active]:text-secondary text-foreground/70 rounded-none data-[state=active]:rounded-t-lg px-4 py-2 font-semibold data-[state=active]:bg-gray-500/15 data-[state=active]:shadow-none"
					>
						Configuration import de BOM
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<ProfileTab user={user} />
				</TabsContent>

				<TabsContent value="team">
					<TeamTab members={teamMembers} />
				</TabsContent>

				<TabsContent value="billing">
					<Card>
						<CardHeader>
							<CardTitle>Facturation</CardTitle>
						</CardHeader>
						<CardContent>
							<p>Contenu de la section facturation</p>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="import">
					<ParametrageBom />
				</TabsContent>
			</Tabs>
		</div>
	)
}
