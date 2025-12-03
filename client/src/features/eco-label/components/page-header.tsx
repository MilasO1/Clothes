interface PageHeaderProps {
	title: string
}

export function PageHeader({ title }: PageHeaderProps) {
	return <h1 className="text-primary mb-4 text-xl font-medium">{title}</h1>
}
