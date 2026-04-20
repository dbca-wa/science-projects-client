import { useEffect } from "react";

/**
 * Sets the browser tab title and restores the previous title on unmount.
 *
 * @param title - Page-specific title. Non-empty values produce "{title} | SPMS",
 *                empty string produces "SPMS".
 */
export function useDocumentTitle(title: string): void {
	useEffect(() => {
		const previousTitle = document.title;
		document.title = title ? `${title} | SPMS` : "SPMS";
		return () => {
			document.title = previousTitle;
		};
	}, [title]);
}
