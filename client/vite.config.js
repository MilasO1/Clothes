import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import viteReact from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import { resolve } from "node:path"

export default {
	base: "./",
	define: {
		VERSION: JSON.stringify(process.env.VERSION),
	},
	plugins: [tanstackRouter({ autoCodeSplitting: true }), viteReact(), tailwindcss(), svgr()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/testing/vitest.setup.ts"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
}
