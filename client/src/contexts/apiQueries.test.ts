import { beforeEach, describe, expect, it, vi } from "vitest"
import { request } from "./apiQueries.js"

// Types
type MockResponse = {
	ok: boolean
	status: number
	statusText: string
	json: () => Promise<any>
	headers?: Headers
	redirected?: boolean
	type?: ResponseType
	url?: string
}

// Test utilities
const createMockResponse = (data: any, options: Partial<MockResponse> = {}): MockResponse => ({
	ok: true,
	status: 200,
	statusText: "OK",
	json: () => Promise.resolve(data),
	headers: new Headers(),
	redirected: false,
	type: "basic" as ResponseType,
	url: `/test`,
	...options,
})

const setupMocks = () => {
	// Clear all mocks
	vi.clearAllMocks()

	// Mock fetch globally
	window.fetch = vi.fn()

	// Mock window.location
	const mockLocation = {
		pathname: "/",
		href: "",
	}
	Object.defineProperty(window, "location", {
		value: mockLocation,
		writable: true,
	})

	// Mock toast
	vi.mock("sonner", () => ({
		toast: {
			error: vi.fn(),
		},
	}))
}

describe("API Client", () => {
	beforeEach(setupMocks)

	describe("HTTP Methods", () => {
		const testCases = [
			{
				method: "GET",
				endpoint: "/test",
				data: undefined,
				expectedResponse: { data: "test data" },
			},
			{
				method: "POST",
				endpoint: "/test",
				data: { name: "test", value: 123 },
				expectedResponse: { id: 1, name: "test", value: 123 },
			},
			{
				method: "PUT",
				endpoint: "/test/1",
				data: { name: "updated", value: 456 },
				expectedResponse: { id: 1, name: "updated", value: 456 },
			},
			{
				method: "DELETE",
				endpoint: "/test/1",
				data: undefined,
				expectedResponse: { success: true },
			},
		]

		testCases.forEach(({ method, endpoint, data, expectedResponse }) => {
			it(`should make successful ${method} request`, async () => {
				const mockResponse = createMockResponse(expectedResponse)
				vi.mocked(window.fetch).mockImplementation(() => Promise.resolve(mockResponse as Response))

				const response = await request(method, endpoint, data)

				// Verify fetch was called with correct parameters
				expect(fetch).toHaveBeenCalledWith(
					`${endpoint}`,
					expect.objectContaining({
						method,
						...(data && { body: JSON.stringify(data) }),
					})
				)

				// Verify response handling
				expect(response).toEqual(expectedResponse)
			})
		})
	})
})
