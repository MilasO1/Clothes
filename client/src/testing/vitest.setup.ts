import "@testing-library/jest-dom"
import { afterEach, vi } from "vitest"

import { cleanup } from "@testing-library/react"
import { QueryClient } from "@tanstack/react-query"
import { queryClient } from "@/contexts/queryProvider"

// Mock the entire tanstack query integration module
vi.mock("@/integrations/tanstack-query/root-provider", () => {
	const testQueryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	})
	return {
		queryClient: testQueryClient,
		Provider: ({ children }: { children: React.ReactNode }) => children,
	}
})

// Mock window.matchMedia (for tests that inluces the sidebar in it)
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation(() => ({
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	})),
})

afterEach(() => {
	queryClient.clear()
	cleanup()
})
