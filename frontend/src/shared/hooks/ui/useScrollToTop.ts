// Simple hook for scrolling to the top of the page

import { useEffect } from "react";
import { useLocation } from "react-router";

export const useScrollToTop = () => {
	const location = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	return null;
};
