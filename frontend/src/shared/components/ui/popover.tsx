import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/utils";
import { ANIMATION_DURATIONS, ANIMATION_OPEN_DELAY } from "@/shared/constants/animations";

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

function Popover({ children, open: controlledOpen, onOpenChange: controlledOnOpenChange, shouldAnimate = true }: PopoverProps) {
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
		<PopoverContext.Provider value={{ open: isVisible, onOpenChange, isClosing, shouldAnimate, triggerRef }}>
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
			children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void; ref?: React.Ref<HTMLElement> }>,
			{
				onClick: handleClick,
				ref: triggerRef,
			}
		);
	}

	return (
		<button onClick={handleClick} ref={triggerRef as React.RefObject<HTMLButtonElement>} {...props}>
			{children}
		</button>
	);
}

function PopoverContent({
	className,
	children,
	align = "end",
	sideOffset = 4,
}: {
	className?: string;
	children: React.ReactNode;
	align?: "start" | "center" | "end";
	sideOffset?: number;
}) {
	const context = React.useContext(PopoverContext);
	if (!context) throw new Error("PopoverContent must be used within a Popover");

	const { open, onOpenChange, isClosing, shouldAnimate, triggerRef } = context;
	const contentRef = React.useRef<HTMLDivElement>(null);
	const [isOpening, setIsOpening] = React.useState(shouldAnimate);
	const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

	// Calculate position BEFORE showing (prevents flash)
	React.useEffect(() => {
		if (!open || !triggerRef.current) {
			setPosition(null);
			return;
		}

		const updatePosition = () => {
			const triggerRect = triggerRef.current!.getBoundingClientRect();
			const contentRect = contentRef.current?.getBoundingClientRect();
			
			let left = 0;
			let top = triggerRect.bottom + sideOffset;

			if (align === "end") {
				left = triggerRect.right - (contentRect?.width || 288); // 288px = min-w-72
			} else if (align === "center") {
				left = triggerRect.left + (triggerRect.width / 2) - ((contentRect?.width || 288) / 2);
			} else {
				left = triggerRect.left;
			}

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
	}, [open, align, sideOffset, triggerRef]);

	React.useEffect(() => {
		if (!shouldAnimate) {
			setIsOpening(false);
			return;
		}
		const timer = setTimeout(() => setIsOpening(false), ANIMATION_OPEN_DELAY);
		return () => clearTimeout(timer);
	}, [shouldAnimate, open]); // Reset on open

	// Handle click outside to close
	React.useEffect(() => {
		if (!open) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				contentRef.current &&
				!contentRef.current.contains(e.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(e.target as Node)
			) {
				onOpenChange(false);
			}
		};

		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open, onOpenChange, triggerRef]);

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

	// Don't render until we have position calculated
	if (!open || !position) return null;

	return createPortal(
		<div
			ref={contentRef}
			data-slot="popover-content"
			className={cn(
				"fixed z-[9999] min-w-72 rounded-lg p-4 shadow-md outline-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
				shouldAnimate && "transition-all duration-150 ease-out",
				shouldAnimate && isOpening && "opacity-0 scale-95 -translate-y-1",
				shouldAnimate && isClosing && "opacity-0 scale-95 -translate-y-1",
				shouldAnimate && !isOpening && !isClosing && "opacity-100 scale-100 translate-y-0",
				!shouldAnimate && "opacity-100 scale-100",
				className
			)}
			style={{ top: `${position.top}px`, left: `${position.left}px` }}
			role="dialog"
			aria-modal="true"
		>
			{children}
		</div>,
		document.body
	);
}

function PopoverAnchor({
	...props
}: React.ComponentProps<"div">) {
	return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
