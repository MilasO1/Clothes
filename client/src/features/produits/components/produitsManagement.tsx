import api from "@/contexts/apiQueries.js"
import ResourcesManagement from "@/components/resourcesManagement"

import { produitsColumns } from "./produitTableColumns"
import ProduitCreationDialog from "./produitCreationDialog"

export default function ProduitsManagement() {
	return (
		<ResourcesManagement
			getOneQuery={api.produits.get}
			listQuery={api.produits.list()}
			columnsMaker={produitsColumns}
			CreateDialog={ProduitCreationDialog}
			deleteQuery={api.produits.delete()}
			ViewDialog={ProduitCreationDialog}
		/>
	)
}
