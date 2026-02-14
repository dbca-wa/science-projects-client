/// <reference types="vite/client" />

// Declare module for raw imports
declare module "*?raw" {
	const content: string;
	export default content;
}
