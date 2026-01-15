import { breakpoints } from "../../constants/breakpoints";
import { useMediaQuery } from "./useMediaQuery";

export function useBreakpoint() {
	const isXs = useMediaQuery(`(min-width: ${breakpoints.xs}px)`);
	const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}px)`);
	const isMd = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
	const isLg = useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
	const isXl = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);
	const is2Xl = useMediaQuery(`(min-width: ${breakpoints["2xl"]}px)`);

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
