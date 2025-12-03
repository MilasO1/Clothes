import { useState } from "react"

import { ArrowRight } from "lucide-react"

import { useGetBOM } from "@/features/parameters/api/get-bom"
import { useBOMStore } from "@/features/parameters/stores/bom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { CSVTable } from "./csv-table"
import { FileDropzone } from "./file-dropzone"

export function BOMConverter() {
	const [error] = useState<string>("")
	const [isConverting] = useState(false)
	const { mutate: getBOM } = useGetBOM()
	const { selectedFile, completedSteps, csvData, conversionKeyId, setSelectedFile, setCompletedSteps, setCSVData } =
		useBOMStore()

	function handleConversion(file: File) {
		setSelectedFile(file)

		try {
			getBOM(
				{ file, keyId: conversionKeyId! },
				{
					onSuccess: parsedData => {
						setCSVData(parsedData)
						setCompletedSteps([...new Set([...completedSteps, 3])])
						console.log("Conversion completed successfully")
					},
				}
			)
		} catch (err) {
			console.error("Erreur lors de la lecture du fichier CSV", err)
		}
	}

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader>
					<CardTitle>Convertir un fichier</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<FileDropzone withoutConfirmation={true} />

						{error && <p className="text-sm text-red-500">{error}</p>}

						<Button onClick={() => handleConversion(selectedFile!)} disabled={!selectedFile || isConverting}>
							<ArrowRight className="h-4 w-4" />
							{isConverting ? "Conversion en cours..." : "Convertir le fichier"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{csvData.length > 0 && <CSVTable data={csvData} />}
		</div>
	)
}
