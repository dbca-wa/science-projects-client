import { useSyncExternalStore } from "react";

/** Subscribe/unsubscribe helpers for matchMedia */
function subscribeToMedia(query: string, cb: () => void) {
	const mql = window.matchMedia(query);
	const handler = () => cb();

	// modern browsers
	if (mql.addEventListener) {
		mql.addEventListener("change", handler);
	} else {
		// older Safari
		mql.addListener(handler);
	}

	return () => {
		if (mql.removeEventListener) {
			mql.removeEventListener("change", handler);
		} else {
			mql.removeListener(handler);
		}
	};
}

export function useMediaQuery(query: string): boolean {
	const getSnapshot = () =>
		typeof window !== "undefined" ? window.matchMedia(query).matches : false;

	const getServerSnapshot = () => false; // SSR default

	return useSyncExternalStore(
		(cb) => subscribeToMedia(query, cb),
		getSnapshot,
		getServerSnapshot
	);
}
