import type { ReactNode } from "react";

interface ResponsiveLayoutProps {
	/**
	 * Content to render on mobile (< 768px)
	 * DOM order should match mobile visual order (top to bottom)
	 */
	mobileContent: ReactNode;

	/**
	 * Content to render on desktop (≥ 768px)
	 * DOM order should match desktop visual order (left to right, then down)
	 */
	desktopContent: ReactNode;

	/**
	 * Optional className for the container
	 */
	className?: string;

	/**
	 * Breakpoint at which to switch from mobile to desktop layout
	 * @default "md" (768px)
	 */
	breakpoint?: "sm" | "md" | "lg" | "xl";
}

/**
 * ResponsiveLayout component
 *
 * Solves the CSS `order` property tab navigation issue by rendering
 * separate layouts for mobile and desktop, each with DOM order matching
 * its visual order.
 *
 * **Problem**: CSS `order` property changes visual order but NOT DOM order,
 * breaking keyboard tab navigation.
 *
 * **Solution**: Duplicate layouts with show/hide pattern - mobile layout
 * hidden on desktop, desktop layout hidden on mobile.
 *
 * **Usage**:
 * ```tsx
 * <ResponsiveLayout
 *   mobileContent={
 *     <>
 *       <SearchInput />
 *       <Filters />
 *       <Controls />
 *     </>
 *   }
 *   desktopContent={
 *     <div className="flex flex-row gap-4">
 *       <Filters />
 *       <SearchInput />
 *       <Controls />
 *     </div>
 *   }
 * />
 * ```
 *
 * **Key Principles**:
 * - Never use CSS `order` property for interactive elements
 * - DOM order must match visual order at EACH breakpoint
 * - Desktop: Left-to-right, then down (row-by-row scanning)
 * - Mobile: Top-to-bottom (natural stacking)
 *
 * **WCAG Compliance**:
 * - 2.4.3 Focus Order (Level A): Tab order follows meaningful sequence
 * - 2.1.1 Keyboard (Level A): All functionality available via keyboard
 * - 1.3.2 Meaningful Sequence (Level A): Reading order is correct
 */
export const ResponsiveLayout = ({
	mobileContent,
	desktopContent,
	className = "",
	breakpoint = "md",
}: ResponsiveLayoutProps) => {
	// Map breakpoint to Tailwind classes
	const breakpointClasses = {
		sm: { mobile: "sm:hidden", desktop: "hidden sm:block" },
		md: { mobile: "md:hidden", desktop: "hidden md:block" },
		lg: { mobile: "lg:hidden", desktop: "hidden lg:block" },
		xl: { mobile: "xl:hidden", desktop: "hidden xl:block" },
	};

	const classes = breakpointClasses[breakpoint];

	return (
		<>
			{/* Mobile layout - DOM order matches mobile visual order */}
			<div className={`${classes.mobile} ${className}`}>{mobileContent}</div>

			{/* Desktop layout - DOM order matches desktop visual order */}
			<div className={`${classes.desktop} ${className}`}>{desktopContent}</div>
		</>
	);
};
