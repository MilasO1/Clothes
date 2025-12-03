import api from "@/contexts/apiQueries.js"
import ResourcesManagement from "@/components/resourcesManagement"

import { composantsColumns } from "@/features/composants/components/composants-table-columns"
import ComposantDialog from "@/features/composants/components/composant-dialog"

export default function ComposantsManagement() {
	return (
		<ResourcesManagement
			getOneQuery={api.composants.get}
			listQuery={api.composantsWithDetails.list()}
			columnsMaker={onDelete => composantsColumns(onDelete)}
			CreateDialog={ComposantDialog}
			deleteQuery={api.composants.delete()}
			ViewDialog={ComposantDialog}
		/>
	)
}
