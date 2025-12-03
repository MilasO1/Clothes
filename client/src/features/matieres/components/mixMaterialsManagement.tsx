import { useMemo } from "react"

import api from "@/contexts/apiQueries.js"
import ResourcesManagement from "@/components/resourcesManagement"
import { filterCustom, mixMaterialsColumns } from "./materials-table-columns"
import MaterialDialog from "@/features/matieres/components/material-dialog"

export default function MixMaterialsManagement() {
	const { data: materials, isError, refetch } = api.matieres.list()

	const mixMaterials = useMemo(() => {
		return materials?.filter(filterCustom)
	}, [materials])

	const filteredQuery = { data: mixMaterials, isError, refetch }

	return (
		<ResourcesManagement
			getOneQuery={api.matieres.get}
			listQuery={filteredQuery}
			columnsMaker={mixMaterialsColumns}
			CreateDialog={MaterialDialog}
			deleteQuery={api.matieres.delete()}
			ViewDialog={MaterialDialog}
		/>
	)
}
