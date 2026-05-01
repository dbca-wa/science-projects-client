// Simple hook for scrolling to the top of the page

import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Hook that smoothly scrolls to top on genuine route navigation
 *
 * Automatically scrolls to the top of the page when the pathname changes.
 * Uses smooth scrolling for better UX.
 *
 * Only triggers on pathname changes (route navigation), NOT on search param
 * or hash changes. This prevents unwanted scroll-to-top when opening modals,
 * sheets, or changing filters/pagination.
 *
 * Note: This finds the scrollable container in AppLayout (the div with overflow-y-auto)
 * and scrolls that, not the window.
 */
export const useScrollToTop = () => {
	const location = useLocation();

	useEffect(() => {
		// Find the scrollable container (the div with overflow-y-auto in AppLayout)
		const scrollContainer = document.querySelector(".overflow-y-auto");

		if (scrollContainer) {
			scrollContainer.scrollTo({
				top: 0,
				left: 0,
				behavior: "smooth",
			});
		} else {
			// Fallback to window scroll if container not found
			window.scrollTo({
				top: 0,
				left: 0,
				behavior: "smooth",
			});
		}
	}, [location.pathname]);

	return null;
};
