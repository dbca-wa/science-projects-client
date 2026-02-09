import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/shared/lib/utils";
import { ANIMATION_DURATIONS, ANIMATION_OPEN_DELAY } from "@/shared/constants/animations";

/**
 * Drawer component with MobX-compatible animations
 * Uses delayed unmount pattern to prevent animation flicker with MobX observer()
 * 
 * This is a wrapper around the CustomDrawer implementation to maintain
 * compatibility with the standard shadcn/ui Drawer API while providing
 * MobX-compatible animations.
 */

type DrawerProps = {
	children: React.ReactNode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dismissible?: boolean;
	shouldScaleBackground?: boolean;
	shouldAnimate?: boolean;
};

const DrawerContext = React.createContext<{
	onOpenChange: (open: boolean) => void;
	isClosing?: boolean;
	shouldAnimate: boolean;
} | null>(null);

function Drawer({
	children,
	open,
	onOpenChange,
	dismissible = true,
	shouldScaleBackground = false,
	shouldAnimate = true,
}: DrawerProps) {
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

	if (!isVisible) return null;

	return (
		<DrawerContext.Provider value={{ onOpenChange, isClosing, shouldAnimate }}>
			<DrawerPrimitive.Root
				open={true} // Always true when visible
				onOpenChange={(newOpen) => {
					if (!newOpen) {
						onOpenChange(false);
					}
				}}
				dismissible={dismissible}
				shouldScaleBackground={shouldScaleBackground}
			>
				{children}
			</DrawerPrimitive.Root>
		</DrawerContext.Provider>
	);
}

function DrawerTrigger({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay() {
	const context = React.useContext(DrawerContext);
	if (!context) throw new Error("DrawerOverlay must be used within a Drawer");

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
		<DrawerPrimitive.Overlay
			data-slot="drawer-overlay"
			className={cn(
				"fixed inset-0 z-50 bg-black/50",
				shouldAnimate && "transition-opacity duration-300",
				shouldAnimate && isOpening && "opacity-0",
				shouldAnimate && isClosing && "opacity-0",
				shouldAnimate && !isOpening && !isClosing && "opacity-100",
				!shouldAnimate && "opacity-100"
			)}
		/>
	);
}

function DrawerContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
	const context = React.useContext(DrawerContext);
	if (!context) throw new Error("DrawerContent must be used within a Drawer");

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
		<DrawerPortal data-slot="drawer-portal">
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot="drawer-content"
				className={cn(
					"group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
					"data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
					"data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
					"data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
					"data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
					// Animation classes
					shouldAnimate && "transition-transform duration-300 ease-in-out",
					shouldAnimate && isOpening && "translate-y-full",
					shouldAnimate && isClosing && "translate-y-full",
					shouldAnimate && !isOpening && !isClosing && "translate-y-0",
					!shouldAnimate && "translate-y-0",
					className
				)}
				{...props}
			>
				<div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-header"
			className={cn(
				"flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
				className
			)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="drawer-footer"
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			{...props}
		/>
	);
}

function DrawerTitle({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
	return (
		<DrawerPrimitive.Title
			data-slot="drawer-title"
			className={cn("text-foreground font-semibold", className)}
			{...props}
		/>
	);
}

function DrawerDescription({
	className,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};

