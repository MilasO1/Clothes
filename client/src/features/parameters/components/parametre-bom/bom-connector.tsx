import { useBOMStore } from "@/features/parameters/stores/bom"

import { Card } from "@/components/ui/card"

import { BOMConfiguration } from "./bom-configuration"
import { BOMConverter } from "./bom-converter"
import { FileDropzone } from "./file-dropzone"
import { Stepper } from "./stepper"

export default function BOMConnector() {
	const { currentStep } = useBOMStore()

	return (
		<Card className="mx-auto max-w-4xl rounded-md p-4 shadow-none sm:p-6">
			<h1 className="text-primary text-lg font-medium uppercase sm:text-xl">
				Paramétrage de l&apos;automatisation de l&apos;import des Bill of material (BOM)
			</h1>

			<Stepper />

			<div className="mt-6 space-y-8">
				{currentStep === 1 && <FileDropzone />}
				{currentStep === 2 && <BOMConfiguration />}
				{currentStep === 3 && <BOMConverter />}
			</div>
		</Card>
	)
}
