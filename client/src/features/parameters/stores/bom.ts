import { create } from "zustand"

interface BOMState {
	selectedFile: File | null
	currentStep: number
	csvData: string[][]
	completedSteps: number[]
	conversionKeyId: string | undefined
	setSelectedFile: (file: File | null) => void
	setCSVData: (data: string[][]) => void
	setCurrentStep: (step: number) => void
	setCompletedSteps: (steps: number[]) => void
	setConversionKeyId: (id: string) => void
}

export const useBOMStore = create<BOMState>(set => ({
	selectedFile: null,
	currentStep: 1,
	csvData: [],
	completedSteps: [],
	conversionKeyId: undefined,
	setSelectedFile: file => set({ selectedFile: file }),
	setCSVData: data => set({ csvData: data }),
	setCurrentStep: step => set({ currentStep: step }),
	setCompletedSteps: steps => set({ completedSteps: steps }),
	setConversionKeyId: id => set({ conversionKeyId: id }),
}))
