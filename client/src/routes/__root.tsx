import { Outlet, createRootRoute, redirect } from "@tanstack/react-router"

import { Toaster } from "@/components/ui/sonner"

export const Route = createRootRoute({
	beforeLoad: async () => {
		const resp = await fetch("/api/me")
		if (!resp.ok) {
			throw redirect({ href: "/.auth/login", reloadDocument: true })
		}
	},
	component: () => (
		<>
			<Outlet />
			<Toaster />
		</>
	),
})
