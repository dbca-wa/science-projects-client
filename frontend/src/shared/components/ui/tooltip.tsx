import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

/**
 * Tooltip component with MobX-compatible animations
 * Uses delayed unmount pattern to prevent animation flicker with MobX observer()
 */

const ANIMATION_DURATION = 150;
const ANIMATION_OPEN_DELAY = 10;
const DEFAULT_DELAY = 300;

type TooltipProps = {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	delayDuration?: number;
};

const TooltipContext = React.createContext<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isClosing?: boolean;
	setTriggerElement: (element: HTMLElement | null) => void;
	triggerElement: HTMLElement | null;
	delayDuration: number;
} | null>(null);

function Tooltip({
	children,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	delayDuration = DEFAULT_DELAY,
}: TooltipProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const [isVisible, setIsVisible] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
	const [triggerElement, setTriggerElement] =
		React.useState<HTMLElement | null>(null);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	// Use controlled or uncontrolled state
	const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
	const onOpenChange = controlledOnOpenChange || setUncontrolledOpen;

	// Handle open/close with animation
	React.useEffect(() => {
		if (open) {
			setIsVisible(true);
			setIsClosing(false);
		} else if (isVisible && !isClosing) {
			setIsClosing(true);
			timeoutRef.current = setTimeout(() => {
				setIsVisible(false);
				setIsClosing(false);
			}, ANIMATION_DURATION);
		}
	}, [open, isVisible, isClosing]);

	// Cleanup timeouts on unmount
	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	return (
		<TooltipContext.Provider
			value={{
				open: isVisible,
				onOpenChange,
				isClosing,
				setTriggerElement,
				triggerElement,
				delayDuration,
			}}
		>
			{children}
		</TooltipContext.Provider>
	);
}

function TooltipTrigger({
	children,
	asChild,
	...props
}: {
	children: React.ReactNode;
	asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
	const context = React.useContext(TooltipContext);
	if (!context) throw new Error("TooltipTrigger must be used within a Tooltip");

	const { onOpenChange, setTriggerElement, delayDuration } = context;
	const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const elementRef = React.useRef<HTMLElement>(null);

	const handleMouseEnter = () => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
		hoverTimeoutRef.current = setTimeout(() => {
			onOpenChange(true);
		}, delayDuration);
	};

	const handleMouseLeave = () => {
		if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
		onOpenChange(false);
	};

	React.useEffect(() => {
		if (elementRef.current) {
			setTriggerElement(elementRef.current);
		}
	}, [setTriggerElement]);

	React.useEffect(() => {
		return () => {
			if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
		};
	}, []);

	if (asChild && React.isValidElement(children)) {
		// Clone the child and add our event handlers and ref
		const childProps = children.props as Record<string, unknown>;
		// eslint-disable-next-line react-hooks/refs
		return React.cloneElement(children, {
			...childProps,
			ref: elementRef,
			onMouseEnter: (e: React.MouseEvent) => {
				handleMouseEnter();
				(
					childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined
				)?.(e);
			},
			onMouseLeave: (e: React.MouseEvent) => {
				handleMouseLeave();
				(
					childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined
				)?.(e);
			},
		} as React.HTMLAttributes<HTMLElement>);
	}

	return (
		<span
			ref={elementRef as React.RefObject<HTMLSpanElement>}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			{...props}
		>
			{children}
		</span>
	);
}

function TooltipContent({
	className,
	children,
	side = "top",
	sideOffset = 4,
	variant = "default",
}: {
	className?: string;
	children: React.ReactNode;
	side?: "top" | "bottom" | "left" | "right";
	sideOffset?: number;
	variant?: "default" | "light";
}) {
	const context = React.useContext(TooltipContext);
	if (!context) throw new Error("TooltipContent must be used within a Tooltip");

	const { open, isClosing, triggerElement } = context;
	const contentRef = React.useRef<HTMLDivElement>(null);
	const [isOpening, setIsOpening] = React.useState(true);
	const [position, setPosition] = React.useState<{
		top: number;
		left: number;
	} | null>(null);

	// Calculate position BEFORE showing (prevents flash)
	React.useEffect(() => {
		if (!open || !triggerElement) {
			setPosition(null);
			return;
		}

		const updatePosition = () => {
			const triggerRect = triggerElement.getBoundingClientRect();
			const contentRect = contentRef.current?.getBoundingClientRect();
			const contentWidth = contentRect?.width || 200;
			const contentHeight = contentRect?.height || 40;

			let top = 0;
			let left = 0;

			switch (side) {
				case "top":
					top = triggerRect.top - contentHeight - sideOffset;
					left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
					break;
				case "bottom":
					top = triggerRect.bottom + sideOffset;
					left = triggerRect.left + triggerRect.width / 2 - contentWidth / 2;
					break;
				case "left":
					top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
					left = triggerRect.left - contentWidth - sideOffset;
					break;
				case "right":
					top = triggerRect.top + triggerRect.height / 2 - contentHeight / 2;
					left = triggerRect.right + sideOffset;
					break;
			}

			// Keep within viewport
			const padding = 8;
			left = Math.max(
				padding,
				Math.min(left, window.innerWidth - contentWidth - padding)
			);
			top = Math.max(
				padding,
				Math.min(top, window.innerHeight - contentHeight - padding)
			);

			setPosition({ top, left });
		};

		// Calculate position immediately
		updatePosition();

		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);

		return () => {
			window.removeEventListener("resize", updatePosition);
			window.removeEventListener("scroll", updatePosition, true);
		};
	}, [open, side, sideOffset, triggerElement]);

	React.useEffect(() => {
		const timer = setTimeout(() => setIsOpening(false), ANIMATION_OPEN_DELAY);
		return () => clearTimeout(timer);
	}, [open]);

	// Don't render until open
	if (!open) return null;

	return createPortal(
		<div
			ref={contentRef}
			data-slot="tooltip-content"
			className={cn(
				"fixed z-[10000] rounded-md px-3 py-1.5 text-xs pointer-events-none",
				variant === "light"
					? "bg-white text-slate-700 shadow-md border border-slate-200"
					: "bg-foreground text-background",
				(!position || isOpening) && "opacity-0 scale-95",
				isClosing && "opacity-0 scale-95",
				position && !isOpening && !isClosing && "opacity-100 scale-100",
				className
			)}
			style={{
				...(position
					? { top: `${position.top}px`, left: `${position.left}px` }
					: {
							top: "0px",
							left: "0px",
							visibility: "hidden",
						}),
				transition: "opacity 150ms ease-out, transform 150ms ease-out",
			}}
			role="tooltip"
		>
			{children}
		</div>,
		document.body
	);
}

export { Tooltip, TooltipTrigger, TooltipContent };
