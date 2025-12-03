import { StrictMode } from "react"

import QueryProvider from "@/contexts/queryProvider"
import { createRoot } from "react-dom/client"

import "./styles.css"

const hasDark = localStorage.getItem("color-scheme") === "dark"
document.documentElement.classList.toggle("dark", hasDark)

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryProvider />
	</StrictMode>
)
