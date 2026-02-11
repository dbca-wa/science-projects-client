import { BREAKPOINTS } from "../../constants/breakpoints";
import { useMediaQuery } from "./useMediaQuery";

export function useBreakpoint() {
	const isXs = useMediaQuery(`(min-width: ${BREAKPOINTS.xs}px)`);
	const isSm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
	const isMd = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
	const isLg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
	const isXl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
	const is2Xl = useMediaQuery(`(min-width: ${BREAKPOINTS["2xl"]}px)`);

	return {
		isXs,
		isSm,
		isMd,
		isLg,
		isXl,
		is2Xl,
		isMobile: !isSm,
		isTablet: isSm && !isLg,
		isDesktop: isLg,
	};
}
