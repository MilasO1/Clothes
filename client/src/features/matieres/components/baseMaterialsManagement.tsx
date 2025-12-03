import { useMemo } from "react"

import api from "@/contexts/apiQueries.js"
import ResourcesManagement from "@/components/resourcesManagement"
import { filterCustom, baseMaterialsColumns } from "./materials-table-columns"

export default function BaseMaterialsManagement() {
	const { data: materials, isError, refetch } = api.matieres.list()

	const baseMaterials = useMemo(() => {
		return materials?.filter(mat => !filterCustom(mat))
	}, [materials])

	const filteredQuery = { data: baseMaterials, isError, refetch }

	return (
		<ResourcesManagement
			getOneQuery={api.matieres.get}
			listQuery={filteredQuery}
			columnsMaker={() => baseMaterialsColumns}
		/>
	)
}
