import { useScreenSize } from "./useScreenSize";

export function useResponsiveValue<T>(values: {
	xs?: T;
	sm?: T;
	md?: T;
	lg?: T;
	xl?: T;
	"2xl"?: T;
}): T | undefined {
	const screenSize = useScreenSize();

	if (screenSize === "2xl" && values["2xl"]) return values["2xl"];
	if ((screenSize === "2xl" || screenSize === "xl") && values.xl)
		return values.xl;
	if (screenSize === "2xl" || screenSize === "xl" || screenSize === "lg") {
		if (values.lg) return values.lg;
	}
	if (screenSize !== "xs" && values.md) return values.md;
	if (screenSize !== "xs" && values.sm) return values.sm;
	return values.xs;
}
