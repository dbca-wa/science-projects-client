import * as React from "react";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "./custom/buttonVariants";

/**
 * AlertDialog component with MobX-compatible animations
 * Returns null when closed to prevent animation flicker with MobX observer()
 */

type AlertDialogProps = {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shouldAnimate?: boolean;
};

const AlertDialogContext = React.createContext<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	shouldAnimate: boolean;
} | null>(null);

function AlertDialog({ children, open, onOpenChange, shouldAnimate = false }: AlertDialogProps) {
	// Handle escape key to close
	React.useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && open) {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [open, onOpenChange]);

	return (
		<AlertDialogContext.Provider value={{ open, onOpenChange, shouldAnimate }}>
			{children}
		</AlertDialogContext.Provider>
	);
}

function AlertDialogTrigger({
	children,
	asChild,
}: {
	children: React.ReactNode;
	asChild?: boolean;
}) {
	const context = React.useContext(AlertDialogContext);
	if (!context)
		throw new Error("AlertDialogTrigger must be used within an AlertDialog");

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

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

function AlertDialogOverlay() {
	return <div className="fixed inset-0 z-[9998] bg-black/50" />;
}

function AlertDialogContent({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const context = React.useContext(AlertDialogContext);
	if (!context)
		throw new Error("AlertDialogContent must be used within an AlertDialog");

	const { open, onOpenChange } = context;
	const contentRef = React.useRef<HTMLDivElement>(null);

	// Handle backdrop click to close
	React.useEffect(() => {
		if (!open) return;

		const handleBackdropClick = (e: MouseEvent) => {
			if (
				contentRef.current &&
				!contentRef.current.contains(e.target as Node)
			) {
				onOpenChange(false);
			}
		};

		document.addEventListener("mousedown", handleBackdropClick);
		return () => document.removeEventListener("mousedown", handleBackdropClick);
	}, [open, onOpenChange]);

	// Return null when closed - prevents animation flicker
	if (!open) return null;

	return (
		<AlertDialogPortal>
			<AlertDialogOverlay />
			<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
				<div
					ref={contentRef}
					data-slot="alert-dialog-content"
					className={cn(
						"relative w-full max-w-[calc(100%-2rem)] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 sm:max-w-lg",
						className
					)}
					role="alertdialog"
					aria-modal="true"
				>
					{children}
				</div>
			</div>
		</AlertDialogPortal>
	);
}

function AlertDialogHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-header"
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
			{...props}
		/>
	);
}

function AlertDialogFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
				className
			)}
			{...props}
		/>
	);
}

function AlertDialogTitle({
	className,
	...props
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<h2
			data-slot="alert-dialog-title"
			className={cn("text-lg font-semibold", className)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	asChild,
	...props
}: {
	className?: string;
	children: React.ReactNode;
	asChild?: boolean;
}) {
	if (asChild) {
		return <>{props.children}</>;
	}
	return (
		<div
			data-slot="alert-dialog-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function AlertDialogAction({
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={cn(buttonVariants(), "text-white cursor-pointer", className)}
			{...props}
		/>
	);
}

function AlertDialogCancel({
	className,
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const context = React.useContext(AlertDialogContext);
	if (!context)
		throw new Error("AlertDialogCancel must be used within an AlertDialog");

	const { onOpenChange } = context;

	return (
		<button
			onClick={(e) => {
				props.onClick?.(e);
				onOpenChange(false);
			}}
			className={cn(buttonVariants({ variant: "outline" }), className)}
			{...props}
		/>
	);
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
