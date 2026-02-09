import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { ANIMATION_DURATIONS, ANIMATION_OPEN_DELAY } from "@/shared/constants/animations";

/**
 * Sheet component with MobX-compatible animations
 * Uses delayed unmount pattern to prevent animation flicker with MobX observer()
 */

type SheetProps = {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	modal?: boolean;
	shouldAnimate?: boolean;
};

const SheetContext = React.createContext<{
	onOpenChange: (open: boolean) => void;
	isClosing?: boolean;
	shouldAnimate: boolean;
} | null>(null);

function Sheet({ children, open, onOpenChange, modal: _modal = true, shouldAnimate = true }: SheetProps) {
	const [isVisible, setIsVisible] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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
				}, ANIMATION_DURATIONS.SHEET);
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

	// Handle escape key
	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && open) {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open, onOpenChange]);

	if (!isVisible) return null;

	return (
		<SheetContext.Provider value={{ onOpenChange, isClosing, shouldAnimate }}>
			<div className="fixed inset-0 z-50">{children}</div>
		</SheetContext.Provider>
	);
}

function SheetTrigger({
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick?: () => void;
}) {
	return <div onClick={onClick}>{children}</div>;
}

function SheetClose(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const context = React.useContext(SheetContext);
	if (!context) throw new Error("SheetClose must be used within a Sheet");

	const { onOpenChange } = context;

	return (
		<button
			type="button"
			{...props}
			onClick={(e) => {
				props.onClick?.(e);
				onOpenChange(false);
			}}
		/>
	);
}

function SheetOverlay() {
	const context = React.useContext(SheetContext);
	if (!context) throw new Error("SheetOverlay must be used within a Sheet");

	const { onOpenChange, isClosing, shouldAnimate } = context;
	const [isOpening, setIsOpening] = React.useState(shouldAnimate);

	React.useEffect(() => {
		if (!shouldAnimate) {
			setIsOpening(false);
			return;
		}
		const timer = setTimeout(() => setIsOpening(false), ANIMATION_OPEN_DELAY);
		return () => clearTimeout(timer);
	}, [shouldAnimate]);

	return (
		<div
			className={cn(
				"fixed inset-0 bg-black/50 z-49",
				shouldAnimate && "transition-opacity duration-300",
				shouldAnimate && isOpening && "opacity-0",
				shouldAnimate && isClosing && "opacity-0",
				shouldAnimate && !isOpening && !isClosing && "opacity-100",
				!shouldAnimate && "opacity-100"
			)}
			onClick={() => onOpenChange(false)}
			aria-hidden="true"
		/>
	);
}

function SheetContent({
	className,
	children,
	side = "right",
}: {
	className?: string;
	children: React.ReactNode;
	side?: "top" | "right" | "bottom" | "left";
}) {
	const context = React.useContext(SheetContext);
	if (!context) throw new Error("SheetContent must be used within a Sheet");

	const { isClosing, shouldAnimate } = context;
	const [isOpening, setIsOpening] = React.useState(shouldAnimate);

	React.useEffect(() => {
		if (!shouldAnimate) {
			setIsOpening(false);
			return;
		}
		const timer = setTimeout(() => setIsOpening(false), ANIMATION_OPEN_DELAY);
		return () => clearTimeout(timer);
	}, [shouldAnimate]);

	return (
		<>
			<div
				className={cn(
					"fixed flex flex-col gap-4 bg-white dark:bg-gray-900 z-50",
					shouldAnimate && "transition-transform duration-300 ease-in-out",
					side === "left" && [
						"left-0 inset-y-0 h-full border-r-[1px] border-gray-300 dark:border-gray-700 shadow-[5px_0_15px_rgba(0,0,0,0.1)]",
						shouldAnimate && isOpening && "-translate-x-full",
						shouldAnimate && isClosing && "-translate-x-full",
						shouldAnimate && !isOpening && !isClosing && "translate-x-0",
						!shouldAnimate && "translate-x-0",
					],
					side === "right" && [
						"right-0 inset-y-0 h-full border-l-[1px] border-gray-300 dark:border-gray-700 shadow-[-5px_0_15px_rgba(0,0,0,0.1)]",
						shouldAnimate && isOpening && "translate-x-full",
						shouldAnimate && isClosing && "translate-x-full",
						shouldAnimate && !isOpening && !isClosing && "translate-x-0",
						!shouldAnimate && "translate-x-0",
					],
					side === "top" && [
						"top-0 inset-x-0 w-full border-b-[1px] border-gray-300 dark:border-gray-700 shadow-[0_5px_15px_rgba(0,0,0,0.1)]",
						shouldAnimate && isOpening && "-translate-y-full",
						shouldAnimate && isClosing && "-translate-y-full",
						shouldAnimate && !isOpening && !isClosing && "translate-y-0",
						!shouldAnimate && "translate-y-0",
					],
					side === "bottom" && [
						"bottom-0 inset-x-0 w-full border-t-[1px] border-gray-300 dark:border-gray-700 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]",
						shouldAnimate && isOpening && "translate-y-full",
						shouldAnimate && isClosing && "translate-y-full",
						shouldAnimate && !isOpening && !isClosing && "translate-y-0",
						!shouldAnimate && "translate-y-0",
					],
					className
				)}
				aria-modal="true"
				role="dialog"
			>
				{children}
			</div>
			<SheetOverlay />
		</>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn("flex flex-col gap-1.5 p-4", className)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			{...props}
		/>
	);
}

function SheetTitle({ className, ...props }: { className?: string; children: React.ReactNode }) {
	return (
		<h2
			data-slot="sheet-title"
			className={cn("text-foreground font-semibold", className)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<p
			data-slot="sheet-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
};
