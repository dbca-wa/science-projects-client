"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { XIcon, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
	ANIMATION_DURATIONS,
	ANIMATION_OPEN_DELAY,
} from "@/shared/constants/animations";

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
	zIndex?: number;
};

const DialogContext = React.createContext<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isClosing?: boolean;
	shouldAnimate: boolean;
	zIndex: number;
} | null>(null);

function Dialog({
	children,
	open,
	onOpenChange,
	modal: _modal = true,
	shouldAnimate = true,
	zIndex = 50,
}: DialogProps) {
	const [isVisible, setIsVisible] = React.useState(false);
	const [isClosing, setIsClosing] = React.useState(false);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

	// Handle open/close with animation
	React.useEffect(() => {
		if (open) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- animation lifecycle
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

	// Handle escape key and body scroll lock
	React.useEffect(() => {
		if (!open) return;

		// Lock body scroll when dialog is open
		const originalOverflow = document.body.style.overflow;
		const originalPaddingRight = document.body.style.paddingRight;

		// Calculate scrollbar width to prevent layout shift
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;

		document.body.style.overflow = "hidden";
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleEscape);

		return () => {
			document.removeEventListener("keydown", handleEscape);
			// Restore original styles
			document.body.style.overflow = originalOverflow;
			document.body.style.paddingRight = originalPaddingRight;
		};
	}, [open, onOpenChange]);

	if (!isVisible) return null;

	return (
		<DialogContext.Provider
			value={{ open, onOpenChange, isClosing, shouldAnimate, zIndex }}
		>
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
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- mount lifecycle
		setMounted(true);
		return () => setMounted(false);
	}, []);

	if (!mounted) return null;

	return ReactDOM.createPortal(children, document.body);
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

	const { isClosing, shouldAnimate, onOpenChange, zIndex } = context;
	const [isOpening, setIsOpening] = React.useState(shouldAnimate);
	const overlayRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!shouldAnimate) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- animation lifecycle
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
				"fixed inset-0 bg-black/50 overflow-hidden",
				shouldAnimate && "transition-opacity duration-200",
				shouldAnimate && isOpening && "opacity-0",
				shouldAnimate && isClosing && "opacity-0",
				shouldAnimate && !isOpening && !isClosing && "opacity-100",
				!shouldAnimate && "opacity-100"
			)}
			style={{ zIndex }}
		/>
	);
}

/**
 * DialogContent component
 *
 * Main content container for the dialog with optional scroll indicators.
 *
 * @param enableScrollIndicators - When true, displays animated scroll indicators (ChevronUp/ChevronDown)
 *                                  to show when content is scrollable. Requires adding `data-scrollable`
 *                                  attribute to the scrollable container element.
 *
 * @example
 * ```tsx
 * <DialogContent enableScrollIndicators={true}>
 *   <DialogHeader>...</DialogHeader>
 *   <div className="overflow-y-auto" data-scrollable>
 *     {/* Scrollable content *\/}
 *   </div>
 * </DialogContent>
 * ```
 */
function DialogContent({
	className,
	children,
	showCloseButton = true,
	enableScrollIndicators = false,
}: {
	className?: string;
	children: React.ReactNode;
	showCloseButton?: boolean;
	enableScrollIndicators?: boolean;
}) {
	const context = React.useContext(DialogContext);
	if (!context) throw new Error("DialogContent must be used within a Dialog");

	const { onOpenChange, isClosing, shouldAnimate, zIndex } = context;
	const [isOpening, setIsOpening] = React.useState(shouldAnimate);

	// Scroll indicator state
	const [showScrollDown, setShowScrollDown] = React.useState(false);
	const [showScrollUp, setShowScrollUp] = React.useState(false);
	const [scrollableElement, setScrollableElement] =
		React.useState<HTMLElement | null>(null);
	const [indicatorPosition, setIndicatorPosition] = React.useState<{
		top: number;
		right: number;
		bottom: number;
	} | null>(null);

	// Use callback ref to know when the element is mounted
	const [contentElement, setContentElement] =
		React.useState<HTMLDivElement | null>(null);
	const contentRefCallback = React.useCallback(
		(node: HTMLDivElement | null) => {
			setContentElement(node);
		},
		[]
	);

	React.useEffect(() => {
		if (!shouldAnimate) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- animation lifecycle
			setIsOpening(false);
			return;
		}
		const timer = setTimeout(() => setIsOpening(false), ANIMATION_OPEN_DELAY);
		return () => clearTimeout(timer);
	}, [shouldAnimate]);

	// Auto-focus first focusable element and trap focus within dialog
	React.useEffect(() => {
		if (!contentElement) return;

		const focusableSelector =
			'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href]';

		// Auto-focus first input or focusable element
		const timer = setTimeout(() => {
			const firstInput = contentElement.querySelector<HTMLElement>(
				"input:not([disabled]), textarea:not([disabled])"
			);
			const firstFocusable =
				firstInput ||
				contentElement.querySelector<HTMLElement>(focusableSelector);
			firstFocusable?.focus();
		}, 50);

		// Focus trap: keep Tab within the dialog
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Tab") return;

			const focusable =
				contentElement.querySelectorAll<HTMLElement>(focusableSelector);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			clearTimeout(timer);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [contentElement]);

	// Handle scroll indicators
	React.useEffect(() => {
		if (!enableScrollIndicators) {
			return;
		}

		if (!contentElement) {
			return;
		}

		// let scrollableElement: HTMLElement | null = null;
		let scrollListener: (() => void) | null = null;
		let resizeObserver: ResizeObserver | null = null;
		let mutationObserver: MutationObserver | null = null;
		let warningTimeout: NodeJS.Timeout | null = null;
		let updateIndicatorPosition: (() => void) | null = null;

		const setupScrollMonitoring = (element: HTMLElement) => {
			// Store the scrollable element for portal rendering
			setScrollableElement(element);

			// Add relative positioning to the scrollable element if not already present
			const computedStyle = window.getComputedStyle(element);
			if (computedStyle.position === "static") {
				element.style.position = "relative";
			}

			updateIndicatorPosition = () => {
				const rect = element.getBoundingClientRect();
				setIndicatorPosition({
					top: rect.top,
					right: window.innerWidth - rect.right,
					bottom: window.innerHeight - rect.bottom,
				});
			};

			const handleScroll = () => {
				const { scrollTop, scrollHeight, clientHeight } = element;
				const isScrollable = scrollHeight > clientHeight;

				// Show down arrow if scrollable and not at bottom
				const shouldShowDown =
					isScrollable && scrollTop < scrollHeight - clientHeight - 10;
				const shouldShowUp = isScrollable && scrollTop > 10;

				setShowScrollDown(shouldShowDown);
				setShowScrollUp(shouldShowUp);

				// Update position on scroll
				updateIndicatorPosition?.();
			};

			// Wait for dialog animation to complete (ANIMATION_OPEN_DELAY + small buffer)
			setTimeout(() => {
				handleScroll();
				updateIndicatorPosition?.();
			}, 250);

			// Add scroll listener
			scrollListener = handleScroll;
			element.addEventListener("scroll", handleScroll);
			window.addEventListener("scroll", updateIndicatorPosition);
			window.addEventListener("resize", updateIndicatorPosition);

			// Check on resize
			resizeObserver = new ResizeObserver(() => {
				handleScroll();
				updateIndicatorPosition?.();
			});
			resizeObserver.observe(element);
		};

		// Try to find scrollable element immediately
		const element = contentElement.querySelector(
			"[data-scrollable]"
		) as HTMLElement;

		if (element) {
			setupScrollMonitoring(element);
		} else {
			// Use MutationObserver to wait for element to be added
			mutationObserver = new MutationObserver(() => {
				const foundElement = contentElement?.querySelector(
					"[data-scrollable]"
				) as HTMLElement;
				if (foundElement) {
					setupScrollMonitoring(foundElement);
					mutationObserver?.disconnect();
					if (warningTimeout) {
						clearTimeout(warningTimeout);
					}
				}
			});

			mutationObserver.observe(contentElement, {
				childList: true,
				subtree: true,
			});

			// Show warning after 5 seconds if element not found
			warningTimeout = setTimeout(() => {
				mutationObserver?.disconnect();
				console.warn(
					"Dialog: enableScrollIndicators is true but no element with data-scrollable attribute found. " +
						"Add data-scrollable to your scrollable container element."
				);
			}, 5000);
		}

		return () => {
			const element = contentElement?.querySelector(
				"[data-scrollable]"
			) as HTMLElement | null;
			if (element && scrollListener) {
				element.removeEventListener("scroll", scrollListener);
			}
			if (updateIndicatorPosition) {
				window.removeEventListener("scroll", updateIndicatorPosition);
				window.removeEventListener("resize", updateIndicatorPosition);
			}
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			if (mutationObserver) {
				mutationObserver.disconnect();
			}
			if (warningTimeout) {
				clearTimeout(warningTimeout);
			}
			setScrollableElement(null);
			setIndicatorPosition(null);
		};
	}, [enableScrollIndicators, contentElement]);

	return (
		<DialogPortal data-slot="dialog-portal">
			<DialogOverlay />
			<div
				className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none overflow-y-auto"
				style={{ zIndex }}
			>
				<div
					ref={contentRefCallback}
					data-slot="dialog-content"
					className={cn(
						"relative w-full max-w-[calc(100%-2rem)] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 sm:max-w-lg pointer-events-auto my-8",
						shouldAnimate && "transition-all duration-200",
						shouldAnimate && isOpening && "opacity-0 scale-95",
						shouldAnimate && isClosing && "opacity-0 scale-95",
						shouldAnimate &&
							!isOpening &&
							!isClosing &&
							"opacity-100 scale-100",
						!shouldAnimate && "opacity-100 scale-100",
						className
					)}
					role="dialog"
					aria-modal="true"
				>
					{/* Render scroll indicators using fixed positioning via portal to body */}
					{enableScrollIndicators &&
						scrollableElement &&
						indicatorPosition &&
						ReactDOM.createPortal(
							<>
								{/* Scroll indicator - Up (top-right) */}
								{showScrollUp && (
									<button
										type="button"
										className="fixed z-50 transition-all duration-300 cursor-pointer"
										style={{
											top: `${indicatorPosition.top + 8}px`,
											right: `${indicatorPosition.right + 8}px`,
										}}
										onClick={() => {
											scrollableElement.scrollTo({
												top: 0,
												behavior: "smooth",
											});
										}}
										aria-label="Scroll to top"
									>
										<div className="bg-white rounded-full p-2 shadow-lg animate-bounce pointer-events-none">
											<ChevronUp className="size-6 stroke-[3] text-blue-500" />
										</div>
									</button>
								)}

								{/* Scroll indicator - Down (bottom-right) */}
								{showScrollDown && (
									<button
										type="button"
										className="fixed z-50 transition-all duration-300 cursor-pointer"
										style={{
											bottom: `${indicatorPosition.bottom + 8}px`,
											right: `${indicatorPosition.right + 8}px`,
										}}
										onClick={() => {
											scrollableElement.scrollTo({
												top: scrollableElement.scrollHeight,
												behavior: "smooth",
											});
										}}
										aria-label="Scroll to bottom"
									>
										<div className="bg-white rounded-full p-2 shadow-lg animate-bounce pointer-events-none">
											<ChevronDown className="size-6 stroke-[3] text-blue-500" />
										</div>
									</button>
								)}
							</>,
							document.body
						)}

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
			className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
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
				"mt-8", // Increased spacing between content and footer
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
