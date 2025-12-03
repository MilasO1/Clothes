import { Suspense } from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Outlet } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"

import AppSideBar from "@/components/appSideBar"
import { SidebarProvider } from "@/components/ui/sidebar"

export const Route = createFileRoute("/_dashboard")({
	component: DashboardLayout,
})

function DashboardLayout() {
	return (
		<SidebarProvider>
			<AppSideBar />
			<main className="flex-1">
				<Suspense
					fallback={
						<div className="flex h-screen items-center justify-center">
							<Loader2 className="text-primary h-10 w-10 animate-spin" />
						</div>
					}
				>
					<Outlet />
				</Suspense>
			</main>
		</SidebarProvider>
	)
}
