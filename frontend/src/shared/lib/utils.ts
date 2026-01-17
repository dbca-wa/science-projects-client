import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a string to title case (capitalizes first letter of each word)
 * @param str - The string to convert
 * @returns The title-cased string
 * @example toTitleCase("hello world") // "Hello World"
 */
export function toTitleCase(str: string): string {
	return str
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}
