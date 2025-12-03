import sampleBlousonImage from "@/assets/produit-blouson.webp"
import sampleCaleconImage from "@/assets/produit-calecon.webp"
import sampleChaussettesImage from "@/assets/produit-chaussettes.webp"
import sampleMaillotImage from "@/assets/produit-maillot.webp"
import samplePantalonImage from "@/assets/produit-pantalon.webp"
import samplePullImage from "@/assets/produit-pull.webp"
import sampleRobeImage from "@/assets/produit-robe.webp"
import sampleTshirtImage from "@/assets/produit-tshirt.webp"

export const typeToImage = {
	blouson: sampleBlousonImage,
	manteau: sampleBlousonImage,
	veste: sampleBlousonImage,
	chaussettes: sampleChaussettesImage,
	calecon: sampleCaleconImage,
	slip: sampleCaleconImage,
	maillot: sampleMaillotImage,
	"maillot-de-bain": sampleMaillotImage,
	short: samplePantalonImage,
	jean: samplePantalonImage,
	pantalon: samplePantalonImage,
	pull: samplePullImage,
	robe: sampleRobeImage,
	jupe: sampleRobeImage,
	tshirt: sampleTshirtImage,
	"t-shirt": sampleTshirtImage,
	polo: sampleTshirtImage,
}
const prodImageSamples = [
	sampleBlousonImage,
	sampleCaleconImage,
	sampleChaussettesImage,
	sampleMaillotImage,
	samplePantalonImage,
	samplePullImage,
	sampleRobeImage,
	sampleTshirtImage,
]

export function randElem(list) {
	return list[Math.floor(Math.random() * list.length)]
}

export const parentProds = ["Bottoms", "Tops", "Dresses", "Outerwear"]

export const collections = ["Summer Basics", "Denim Collection", "Winter Warmth", "Spring Fashion", "Outerwear"]

export function imageSrc(type) {
	return typeToImage[type] || randElem(prodImageSamples)
}
