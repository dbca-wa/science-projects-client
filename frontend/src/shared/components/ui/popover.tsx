import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/utils";
import {
	ANIMATION_DURATIONS,
	ANIMATION_OPEN_DELAY,
} from "@/shared/constants/animations";

/**
 * Popover component with MobX-compatible animations
 * Uses delayed unmount pattern to prevent animation flicker with MobX observer()
 */

type PopoverProps = {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	shouldAnimate?: boolean;
};

const PopoverContext = React.createContext<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isClosing?: boolean;
	shouldAnimate: boolean;
	triggerRef: React.RefObject<HTMLElement | null>;
} | null>(null);

function Popover({
	children,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	shouldAnimate = true,
}: PopoverProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const [isVisible, setIsVisible] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const triggerRef = React.useRef<HTMLElement | null>(null);

	// Use controlled or uncontrolled state
	const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
	const onOpenChange = controlledOnOpenChange || setUncontrolledOpen;

	// Handle open/close with animation
	React.useEffect(() => {
		if (open) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsVisible(true);
			setIsClosing(false);
		} else if (isVisible && !isClosing) {
			if (shouldAnimate) {
				setIsClosing(true);
				timeoutRef.current = setTimeout(() => {
					setIsVisible(false);
					setIsClosing(false);
				}, ANIMATION_DURATIONS.POPOVER);
			} else {
				setIsVisible(false);
			}
		}
	}, [open, isVisible, isClosing, shouldAnimate]);

	// Cleanup timeout on unmount
	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<PopoverContext.Provider
			value={{
				open: isVisible,
				onOpenChange,
				isClosing,
				shouldAnimate,
				triggerRef,
			}}
		>
			{children}
		</PopoverContext.Provider>
	);
}

function PopoverTrigger({
	children,
	asChild,
	...props
}: {
	children: React.ReactNode;
	asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
	const context = React.useContext(PopoverContext);
	if (!context) throw new Error("PopoverTrigger must be used within a Popover");

	const { open, onOpenChange, triggerRef } = context;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onOpenChange(!open);
	};

	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(
			children as React.ReactElement<{
				onClick?: (e: React.MouseEvent) => void;
				ref?: React.Ref<HTMLElement>;
			}>,
			{
				onClick: handleClick,
				ref: triggerRef,
			}
		);
	}

	return (
		<button
			onClick={handleClick}
			ref={triggerRef as React.RefObject<HTMLButtonElement>}
			{...props}
		>
			{children}
		</button>
	);
}

function PopoverContent({
	className,
	children,
	align = "end",
	side = "bottom",
	sideOffset = 4,
}: {
	className?: string;
	children: React.ReactNode;
	align?: "start" | "center" | "end";
	side?: "top" | "bottom" | "left" | "right";
	sideOffset?: number;
}) {
	const context = React.useContext(PopoverContext);
	if (!context) throw new Error("PopoverContent must be used within a Popover");

	const { open, onOpenChange, isClosing, shouldAnimate, triggerRef } = context;
	const contentRef = React.useRef<HTMLDivElement>(null);
	const [isOpening, setIsOpening] = React.useState(shouldAnimate);
	const [position, setPosition] = React.useState<{
		top: number;
		left: number;
	} | null>(null);

	// Calculate position - uses two-pass render to measure content first
	React.useEffect(() => {
		if (!open || !triggerRef.current) {
			setPosition(null);
			return;
		}

		const updatePosition = () => {
			if (!contentRef.current || !triggerRef.current) return;

			const triggerRect = triggerRef.current.getBoundingClientRect();
			const contentRect = contentRef.current.getBoundingClientRect();
			const contentWidth = contentRect.width;
			const contentHeight = contentRect.height;

			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			let top = 0;
			let left = 0;

			// Calculate vertical position based on side
			if (side === "top") {
				top = triggerRect.top - contentHeight - sideOffset;
				// Collision detection: if would go off top, position below instead
				if (top < 0) {
					top = triggerRect.bottom + sideOffset;
				}
			} else if (side === "bottom") {
				top = triggerRect.bottom + sideOffset;
				// Collision detection: if would go off bottom, position above instead
				if (top + contentHeight > viewportHeight) {
					top = triggerRect.top - contentHeight - sideOffset;
				}
			} else if (side === "left") {
				top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
			} else if (side === "right") {
				top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
			}

			// Calculate horizontal position based on side and align
			if (side === "top" || side === "bottom") {
				if (align === "end") {
					left = triggerRect.right - contentWidth;
				} else if (align === "center") {
					left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
				} else {
					left = triggerRect.left;
				}

				// Collision detection: keep within viewport horizontally
				if (left < 0) {
					left = 8; // 8px padding from edge
				} else if (left + contentWidth > viewportWidth) {
					left = viewportWidth - contentWidth - 8;
				}
			} else if (side === "left") {
				left = triggerRect.left - contentWidth - sideOffset;
				// Collision detection: if would go off left, position right instead
				if (left < 0) {
					left = triggerRect.right + sideOffset;
				}
			} else if (side === "right") {
				left = triggerRect.right + sideOffset;
				// Collision detection: if would go off right, position left instead
				if (left + contentWidth > viewportWidth) {
					left = triggerRect.left - contentWidth - sideOffset;
				}
			}

			setPosition({ top, left });
		};

		// Use requestAnimationFrame to ensure content is rendered before measuring
		const rafId = requestAnimationFrame(() => {
			updatePosition();
		});

		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [open, align, side, sideOffset, triggerRef]);

	React.useEffect(() => {
		if (!shouldAnimate) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIsOpening(false);
			return;
		}
		const timer = setTimeout(() => setIsOpening(false), ANIMATION_OPEN_DELAY);
		return () => clearTimeout(timer);
	}, [shouldAnimate, open]); // Reset on open

	// Handle escape key
	React.useEffect(() => {
		if (!open) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open, onOpenChange]);

	// Don't render if not open
	if (!open) return null;

	return createPortal(
		<>
			{/* Invisible backdrop to block pointer events from reaching content below */}
			{!isClosing && (
				<div
					className="fixed inset-0 z-[9997]"
					onMouseDown={(e) => {
						e.stopPropagation();
						onOpenChange(false);
					}}
				/>
			)}
			<div
				ref={contentRef}
				data-slot="popover-content"
				onMouseDown={(e) => e.stopPropagation()}
				className={cn(
					"fixed z-[9998] min-w-72 rounded-lg p-4 shadow-md outline-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pointer-events-auto cursor-default",
					shouldAnimate &&
						"transition-opacity transition-transform duration-150 ease-out",
					shouldAnimate && isOpening && "opacity-0 scale-95",
					shouldAnimate && isClosing && "opacity-0 scale-95",
					shouldAnimate && !isOpening && !isClosing && "opacity-100 scale-100",
					!shouldAnimate && "opacity-100 scale-100",
					!position && "opacity-0", // Hide while measuring
					className
				)}
				style={
					position
						? { top: `${position.top}px`, left: `${position.left}px` }
						: { top: "-9999px", left: "-9999px" } // Off-screen while measuring
				}
				role="dialog"
				aria-modal="true"
			>
				{children}
			</div>
		</>,
		document.body
	);
}

function PopoverAnchor({ ...props }: React.ComponentProps<"div">) {
	return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
