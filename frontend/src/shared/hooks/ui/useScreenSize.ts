import { useSyncExternalStore } from "react";
import { breakpoints, type Breakpoint } from "../../constants/breakpoints";

function getSize(): Breakpoint {
	if (typeof window === "undefined") return "xs";
	const w = window.innerWidth;
	if (w >= breakpoints["2xl"]) return "2xl";
	if (w >= breakpoints.xl) return "xl";
	if (w >= breakpoints.lg) return "lg";
	if (w >= breakpoints.md) return "md";
	if (w >= breakpoints.sm) return "sm";
	return "xs";
}

export function useScreenSize(): Breakpoint {
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
