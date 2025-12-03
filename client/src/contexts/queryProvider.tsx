import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router"
import { ApiError } from "./apiQueries.js"

// Import the generated route tree
import { routeTree } from "@/routeTree.gen"

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: error => {
			if (error instanceof ApiError) {
				if ((error as any).status === 403) {
					window.location.href = "/.auth/login"
				}
			}
		},
	}),
	mutationCache: new MutationCache({
		onError: error => {
			if (error instanceof ApiError) {
				if ((error as any).status === 403) {
					window.location.href = "/.auth/login"
				}
			}
		},
	}),
})

const hashHistory = createHashHistory()

export const router = createRouter({
	routeTree,
	context: { queryClient },
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	history: hashHistory,
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

export default function QueryProvider() {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	)
}
