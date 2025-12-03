import logo from "@/assets/darwie-logo-principal-blue-light.svg"
import EcoLabelIcon from "@/assets/sidebar-icons/noun-eco-tag-5631908.svg"
import BoiteIdeesIcon from "@/assets/sidebar-icons/noun-idea-7100846.svg"
import ParametresIcon from "@/assets/sidebar-icons/noun-parameters-937548.svg"
import RessourcesIcon from "@/assets/sidebar-icons/noun-textiles-3306992.svg"
import ProduitsIcon from "@/assets/sidebar-icons/shirt bar menu.svg"
import { Link } from "@tanstack/react-router"
import { LogOut } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"

import { queryClient } from "@/contexts/queryProvider.js"
import { listMatieresQueryOptions } from "@/contexts/apiQueries.js"

declare const VERSION: string

export default function AppSideBar() {
	const menuItems = [
		{
			icon: ProduitsIcon,
			label: "Produits",
			href: "/",
		},
		{
			icon: RessourcesIcon,
			label: "Ressources",
			href: "/resources",
			prefetch: () => queryClient.prefetchQuery(listMatieresQueryOptions),
		},
		{
			icon: EcoLabelIcon,
			label: "Stratégies",
			href: "/eco-label",
			badge: "bientôt",
		},
		{
			icon: ParametresIcon,
			label: "Paramètres",
			href: "/parameters",
			badge: "bientôt",
		},
		{
			icon: BoiteIdeesIcon,
			label: "Boite à idées",
			href: "/idea-box",
			badge: "bientôt",
		},
	]

	const handleSignOut = () => {
		window.location.href = "/.auth/logout"
	}

	return (
		<Sidebar>
			<SidebarHeader className="border-sidebar-border border-b p-6">
				<div className="flex flex-col items-center space-y-4">
					<Link to="/">
						<img src={logo} alt="logo" width={150} height={150} />
					</Link>

					<div
						className="flex w-full items-center justify-center px-4"
						onDoubleClick={() => {
							const hasDark = localStorage.getItem("color-scheme") === "dark"
							localStorage.setItem("color-scheme", hasDark ? "light" : "dark")
							document.documentElement.classList.toggle("dark", !hasDark)
						}}
					>
						<Badge variant="outline" className="border-sidebar-border text-primary-foreground rounded-full text-sm">
							Version {VERSION}
						</Badge>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map(item => (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton size={"lg"} asChild>
										<Link to={item.href || "#"} preload={false} onMouseEnter={item.prefetch}>
											<span className="sidebar-icon">
												<img
													className="fill-current text-white"
													src={item.icon}
													alt={`${item.label} icon`}
													width={24}
													height={24}
												/>
											</span>
											<span>{item.label}</span>
											{item.badge && (
												<Badge
													variant="outline"
													className="text-primary ml-auto rounded-full border-none bg-gray-100/60"
												>
													{item.badge}
												</Badge>
											)}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="border-sidebar-border border-t p-0 mb-4">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size={"lg"} className="p-4" onClick={handleSignOut}>
							<LogOut />
							<span>Déconnexion</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
