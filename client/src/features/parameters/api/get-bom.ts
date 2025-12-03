import { useMutation } from "@tanstack/react-query"

interface GetBOMParams {
	file: File
	keyId: string
}

export const useGetBOM = () => {
	return useMutation({
		mutationFn: async (params: GetBOMParams) => {
			const formData = new FormData()
			formData.append("file", params.file)

			const response = await fetch(`./api/boms?keyId=${params.keyId}`, {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const data = await response.text()

			// Parse the response into rows
			const rows = data
				.split("\n")
				.map((line: string) => line.trim())
				.filter((line: string) => line.length > 0)
				.map((line: string) => line.split(",").map((cell: string) => cell.trim()))

			return rows
		},
	})
}
