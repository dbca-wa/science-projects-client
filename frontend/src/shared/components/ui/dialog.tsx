"use client";

import * as React from "react";
import { XIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { ANIMATION_DURATIONS, ANIMATION_OPEN_DELAY } from "@/shared/constants/animations";

/**
 * Dialog component with MobX-compatible animations
 * Uses delayed unmount pattern to allow fade-out animations
 */

type DialogProps = {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	modal?: boolean;
	shouldAnimate?: boolean;
};

const DialogContext = React.createContext<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isClosing?: boolean;
	shouldAnimate: boolean;
} | null>(null);

function Dialog({ children, open, onOpenChange, modal: _modal = true, shouldAnimate = true }: DialogProps) {
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
				}, ANIMATION_DURATIONS.DIALOG);
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
		<DialogContext.Provider value={{ open, onOpenChange, isClosing, shouldAnimate }}>
			{children}
		</DialogContext.Provider>
	);
}

function DialogTrigger({
	children,
	asChild,
}: {
	children: React.ReactNode;
	asChild?: boolean;
}) {
	const context = React.useContext(DialogContext);
	if (!context) throw new Error("DialogTrigger must be used within a Dialog");

	const { onOpenChange } = context;

	const handleClick = () => {
		onOpenChange(true);
	};

	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(
			children as React.ReactElement<{ onClick?: () => void }>,
			{
				onClick: handleClick,
			}
		);
	}

	return <button onClick={handleClick}>{children}</button>;
}

function DialogPortal({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

function DialogClose(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const context = React.useContext(DialogContext);
	if (!context) throw new Error("DialogClose must be used within a Dialog");

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

function DialogOverlay() {
	const context = React.useContext(DialogContext);
	if (!context) throw new Error("DialogOverlay must be used within a Dialog");

	const { isClosing, shouldAnimate, onOpenChange } = context;
	const [isOpening, setIsOpening] = React.useState(shouldAnimate);
	const overlayRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!shouldAnimate) {
			setIsOpening(false);
			return;
		}
		const timer = setTimeout(() => setIsOpening(false), ANIMATION_OPEN_DELAY);
		return () => clearTimeout(timer);
	}, [shouldAnimate]);

	// Handle click on overlay to close dialog
	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		// Only close if clicking directly on the overlay (not on children)
		if (e.target === overlayRef.current) {
			onOpenChange(false);
		}
	};

	return (
		<div
			ref={overlayRef}
			onClick={handleOverlayClick}
			className={cn(
				"fixed inset-0 z-50 bg-black/50",
				shouldAnimate && "transition-opacity duration-200",
				shouldAnimate && isOpening && "opacity-0",
				shouldAnimate && isClosing && "opacity-0",
				shouldAnimate && !isOpening && !isClosing && "opacity-100",
				!shouldAnimate && "opacity-100"
			)}
		/>
	);
}

function DialogContent({
	className,
	children,
	showCloseButton = true,
}: {
	className?: string;
	children: React.ReactNode;
	showCloseButton?: boolean;
}) {
	const context = React.useContext(DialogContext);
	if (!context) throw new Error("DialogContent must be used within a Dialog");

	const { onOpenChange, isClosing, shouldAnimate } = context;
	const contentRef = React.useRef<HTMLDivElement>(null);
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
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					ref={contentRef}
					data-slot="dialog-content"
					className={cn(
						"relative w-full max-w-[calc(100%-2rem)] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 sm:max-w-lg pointer-events-auto",
						shouldAnimate && "transition-all duration-200",
						shouldAnimate && isOpening && "opacity-0 scale-95",
						shouldAnimate && isClosing && "opacity-0 scale-95",
						shouldAnimate && !isOpening && !isClosing && "opacity-100 scale-100",
						!shouldAnimate && "opacity-100 scale-100",
						className
					)}
					role="dialog"
					aria-modal="true"
				>
					{children}
					{showCloseButton && (
						<button
							data-slot="dialog-close"
							onClick={() => onOpenChange(false)}
							className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
						>
							<XIcon />
							<span className="sr-only">Close</span>
						</button>
					)}
				</div>
			</div>
		</DialogPortal>
	);
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-header"
			className={cn(
				"flex flex-col gap-2 text-center sm:text-left",
				className
			)}
			{...props}
		/>
	);
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className
			)}
			{...props}
		/>
	);
}

function DialogTitle({
	className,
	...props
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<h2
			data-slot="dialog-title"
			className={cn("text-lg leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<p
			data-slot="dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
