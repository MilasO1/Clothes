window.onload = function() {
	//<editor-fold desc="Changeable Configuration Block">

	// the following lines will be replaced by docker/configurator, when it runs in a docker-container
	window.ui = SwaggerUIBundle({
		url: "./openapi.json",
		dom_id: '#swagger-ui',
		deepLinking: true,
		presets: [
			SwaggerUIBundle.presets.apis,
			SwaggerUIStandalonePreset
		],
		plugins: [
			SwaggerUIBundle.plugins.DownloadUrl
		],
		layout: "StandaloneLayout",
	})

	//</editor-fold>

	const lien = document.querySelector(".topbar-wrapper > a")
	lien.removeChild(lien.querySelector("svg"))
	lien.href = "/"
	lien.style.backgroundImage = 'url("./logo_darwie.png")'
	lien.style.backgroundSize = "contain"
	lien.style.backgroundRepeat = "no-repeat"
	lien.style.height = "40px"
}
