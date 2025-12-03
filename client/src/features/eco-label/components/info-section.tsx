import type { ReactNode } from "react"

interface InfoSectionProps {
	title: string
	content: ReactNode
}

export function InfoSection({ title, content }: InfoSectionProps) {
	return (
		<div className="flex">
			<div className="flex w-1/4 items-center font-bold text-gray-800">{title}</div>
			<div className="w-3/4 border-l pl-6">{content}</div>
		</div>
	)
}
