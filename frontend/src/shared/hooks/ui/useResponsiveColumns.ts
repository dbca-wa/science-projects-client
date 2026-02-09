import type { BreakpointKey } from "@/shared/constants/breakpoints";
import { useScreenSize } from "./useScreenSize";

export function useResponsiveColumns<T>(
	allColumns: T[],
	responsiveConfig: Partial<Record<BreakpointKey, number>>
): T[] {
	const screenSize = useScreenSize();

	const pick = (): number => {
		switch (screenSize) {
			case "2xl":
				return (
					responsiveConfig["2xl"] ??
					responsiveConfig.xl ??
					responsiveConfig.lg ??
					allColumns.length
				);
			case "xl":
				return (
					responsiveConfig.xl ??
					responsiveConfig.lg ??
					allColumns.length
				);
			case "lg":
				return responsiveConfig.lg ?? allColumns.length;
			case "md":
				return (
					responsiveConfig.md ??
					responsiveConfig.sm ??
					Math.min(4, allColumns.length)
				);
			case "sm":
				return responsiveConfig.sm ?? Math.min(3, allColumns.length);
			default:
				return responsiveConfig.xs ?? Math.min(2, allColumns.length);
		}
	};

	return allColumns.slice(0, pick());
}
