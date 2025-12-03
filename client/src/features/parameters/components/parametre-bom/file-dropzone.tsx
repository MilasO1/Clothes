import { useCallback } from "react"

import { File, Upload, X } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { useBOMStore } from "@/features/parameters/stores/bom"

import { Button } from "@/components/ui/button"

const ACCEPTED_FILE_TYPES = {
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
	"application/vnd.ms-excel": [".xls"],
	"text/csv": [".csv"],
} as const

const DROPZONE_STYLES = {
	base: "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out",
	active: "border-[#006D77] bg-[#006D77]/5",
	inactive: "border-gray-300",
	hasFile: "bg-gray-50",
	hover: "hover:border-[#006D77] cursor-pointer",
}

export function FileDropzone({ withoutConfirmation }: { withoutConfirmation?: boolean }) {
	const { selectedFile, completedSteps, currentStep, setSelectedFile, setCurrentStep, setCompletedSteps } =
		useBOMStore()

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0]
			setSelectedFile(file)
		},
		[setSelectedFile]
	)

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: ACCEPTED_FILE_TYPES,
		multiple: false,
	})

	const handleConfirmImport = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (selectedFile) {
			if (currentStep === 1) {
				setCurrentStep(2)
				setCompletedSteps([...new Set([...completedSteps, 1])])
			}
		}
	}

	const handleRemoveFile = (e: React.MouseEvent) => {
		e.stopPropagation()
		setSelectedFile(null)
	}

	const dropzoneClassName = `
    ${DROPZONE_STYLES.base}
    ${isDragActive ? DROPZONE_STYLES.active : DROPZONE_STYLES.inactive}
    ${selectedFile ? DROPZONE_STYLES.hasFile : ""}
    ${DROPZONE_STYLES.hover}
  `

	return (
		<div {...getRootProps()} className={dropzoneClassName}>
			<input {...getInputProps()} />
			<div className="flex flex-col items-center justify-center gap-4">
				{selectedFile ? (
					<>
						<div className="flex w-full max-w-md items-center gap-4">
							<div className="flex flex-1 items-center gap-3 rounded-lg border bg-white p-3">
								<File className="h-6 w-6 text-[#006D77]" />
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{selectedFile.name}</p>
									<p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
								</div>
								<Button variant="ghost" size="icon" className="shrink-0" onClick={handleRemoveFile}>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>
						{!withoutConfirmation && (
							<div className="mt-4 flex w-full justify-center">
								<Button onClick={handleConfirmImport}>Confirmer l&apos;import et continuer</Button>
							</div>
						)}
					</>
				) : (
					<>
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#006D77]/10">
							<Upload className="h-8 w-8 text-[#006D77]" />
						</div>
						<div className="text-center">
							<p className="text-lg font-medium text-gray-700">Déposez votre fichier BOM ici</p>
							<p className="mt-1 text-sm text-gray-500">ou cliquez pour sélectionner un fichier</p>
						</div>
						<p className="text-xs text-gray-400">Formats acceptés: .xlsx, .xls, .csv</p>
					</>
				)}
			</div>
		</div>
	)
}
