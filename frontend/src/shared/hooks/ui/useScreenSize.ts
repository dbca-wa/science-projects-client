import { useSyncExternalStore } from "react";
import { BREAKPOINTS, type BreakpointKey } from "../../constants/breakpoints";

function getSize(): BreakpointKey {
	if (typeof window === "undefined") return "xs";
	const w = window.innerWidth;
	if (w >= BREAKPOINTS["2xl"]) return "2xl";
	if (w >= BREAKPOINTS.xl) return "xl";
	if (w >= BREAKPOINTS.lg) return "lg";
	if (w >= BREAKPOINTS.md) return "md";
	if (w >= BREAKPOINTS.sm) return "sm";
	return "xs";
}

export function useScreenSize(): BreakpointKey {
	const getSnapshot = () => getSize();

	return useSyncExternalStore((cb) => {
		// (Optional) throttle via rAF to avoid resize storms
		let ticking = false;
		const onResize = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(() => {
					ticking = false;
					cb();
				});
			}
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, getSnapshot);
}
