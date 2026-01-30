"use client";

import * as React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { ANIMATION_DURATIONS, ANIMATION_OPEN_DELAY } from "@/shared/constants/animations";

/**
 * DropdownMenu component with MobX-compatible animations
 * Uses delayed unmount pattern to prevent animation flicker with MobX observer()
 */

type DropdownMenuProps = {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	shouldAnimate?: boolean;
};

const DropdownMenuContext = React.createContext<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isClosing?: boolean;
	shouldAnimate: boolean;
} | null>(null);

function DropdownMenu({ children, open: controlledOpen, onOpenChange: controlledOnOpenChange, shouldAnimate = true }: DropdownMenuProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
	const [isVisible, setIsVisible] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
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
			if (shouldAnimate) {
				setIsClosing(true);
				timeoutRef.current = setTimeout(() => {
					setIsVisible(false);
					setIsClosing(false);
				}, ANIMATION_DURATIONS.DROPDOWN);
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
		<DropdownMenuContext.Provider value={{ open: isVisible, onOpenChange, isClosing, shouldAnimate }}>
			{children}
		</DropdownMenuContext.Provider>
	);
}

function DropdownMenuTrigger({
	children,
	asChild,
	...props
}: {
	children: React.ReactNode;
	asChild?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
	const context = React.useContext(DropdownMenuContext);
	if (!context) throw new Error("DropdownMenuTrigger must be used within a DropdownMenu");

	const { open, onOpenChange } = context;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onOpenChange(!open);
	};

	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(
			children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>,
			{
				onClick: handleClick,
			}
		);
	}

	return (
		<button onClick={handleClick} {...props}>
			{children}
		</button>
	);
}

function DropdownMenuContent({
	className,
	children,
	align = "start",
	sideOffset = 4,
}: {
	className?: string;
	children: React.ReactNode;
	align?: "start" | "center" | "end";
	sideOffset?: number;
}) {
	const context = React.useContext(DropdownMenuContext);
	if (!context) throw new Error("DropdownMenuContent must be used within a DropdownMenu");

	const { open, onOpenChange, isClosing, shouldAnimate } = context;
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

	// Handle click outside to close
	React.useEffect(() => {
		if (!open) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
				onOpenChange(false);
			}
		};

		// Small delay to prevent immediate close from trigger click
		const timer = setTimeout(() => {
			document.addEventListener("mousedown", handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timer);
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open, onOpenChange]);

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

	if (!open) return null;

	return (
		<div
			ref={contentRef}
			data-slot="dropdown-menu-content"
			className={cn(
				"absolute z-50 min-w-[12rem] overflow-hidden rounded-md border bg-white p-1 shadow-md dark:bg-gray-800",
				shouldAnimate && "transition-all duration-150 ease-out",
				shouldAnimate && isOpening && "opacity-0 scale-95 -translate-y-1",
				shouldAnimate && isClosing && "opacity-0 scale-95 -translate-y-1",
				shouldAnimate && !isOpening && !isClosing && "opacity-100 scale-100 translate-y-0",
				!shouldAnimate && "opacity-100 scale-100",
				align === "start" && "left-0",
				align === "center" && "left-1/2 -translate-x-1/2",
				align === "end" && "right-0",
				className
			)}
			style={{ marginTop: `${sideOffset}px` }}
			role="menu"
			aria-orientation="vertical"
		>
			{children}
		</div>
	);
}

function DropdownMenuGroup({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-group"
			className={className}
			{...props}
		/>
	);
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	onClick,
	asChild,
	children,
	...props
}: React.ComponentProps<"div"> & {
	inset?: boolean;
	variant?: "default" | "destructive";
	onClick?: () => void;
	asChild?: boolean;
}) {
	const context = React.useContext(DropdownMenuContext);
	
	const handleClick = () => {
		onClick?.();
		context?.onOpenChange(false);
	};

	const itemClassName = cn(
		"focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
		className
	);

	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(
			children as React.ReactElement<{ 
				className?: string;
				onClick?: (e: React.MouseEvent) => void;
				"data-slot"?: string;
				"data-inset"?: boolean;
				"data-variant"?: string;
				role?: string;
			}>,
			{
				className: cn(itemClassName, (children.props as { className?: string }).className),
				onClick: (e: React.MouseEvent) => {
					(children.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
					handleClick();
				},
				"data-slot": "dropdown-menu-item",
				"data-inset": inset,
				"data-variant": variant,
				role: "menuitem",
				...props,
			}
		);
	}

	return (
		<div
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={itemClassName}
			onClick={handleClick}
			role="menuitem"
			{...props}
		>
			{children}
		</div>
	);
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	onCheckedChange,
	...props
}: React.ComponentProps<"div"> & {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
}) {
	const context = React.useContext(DropdownMenuContext);
	
	const handleClick = () => {
		onCheckedChange?.(!checked);
		context?.onOpenChange(false);
	};

	return (
		<div
			data-slot="dropdown-menu-checkbox-item"
			className={cn(
				"focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
				className
			)}
			role="menuitemcheckbox"
			aria-checked={checked}
			onClick={handleClick}
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				{checked && <CheckIcon className="size-4" />}
			</span>
			{children}
		</div>
	);
}

function DropdownMenuRadioGroup({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-radio-group"
			role="radiogroup"
			className={className}
			{...props}
		/>
	);
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-radio-item"
			className={cn(
				"focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
				className
			)}
			role="menuitemradio"
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<CircleIcon className="size-2 fill-current" />
			</span>
			{children}
		</div>
	);
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: React.ComponentProps<"div"> & {
	inset?: boolean;
}) {
	return (
		<div
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(
				"px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
				className
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-separator"
			className={cn("bg-border -mx-1 my-1 h-px", className)}
			role="separator"
			{...props}
		/>
	);
}

function DropdownMenuShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			className={cn(
				"text-muted-foreground ml-auto text-xs tracking-widest",
				className
			)}
			{...props}
		/>
	);
}

function DropdownMenuSub({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div data-slot="dropdown-menu-sub">{children}</div>;
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<"div"> & {
	inset?: boolean;
}) {
	return (
		<div
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-accent hover:text-accent-foreground cursor-pointer",
				className
			)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto size-4" />
		</div>
	);
}

function DropdownMenuSubContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-sub-content"
			className={cn(
				"bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
				className
			)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
};
