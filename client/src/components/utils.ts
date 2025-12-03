import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function rd(nb: number, decimals = 2) {
	const divis = 10 ** decimals
	return Math.round(nb * divis) / divis
}
