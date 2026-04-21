import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * Custom Accordion — MobX-compatible
 *
 * Replaces Radix accordion to avoid flicker caused by MobX observer()
 * re-renders interrupting Radix's CSS animation measurement cycle.
 * Uses a ref-based height measurement + CSS transition approach that
 * is immune to React re-renders during animation.
 */

// ── Context ──────────────────────────────────────────────────────────────────

interface AccordionContextValue {
	openItems: Set<string>;
	toggle: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
	null
);

function useAccordionContext() {
	const ctx = React.useContext(AccordionContext);
	if (!ctx)
		throw new Error("Accordion components must be used within <Accordion>");
	return ctx;
}

// ── Item Context ─────────────────────────────────────────────────────────────

const AccordionItemContext = React.createContext<string>("");

// ── Accordion Root ───────────────────────────────────────────────────────────

interface AccordionProps {
	type?: "single" | "multiple";
	defaultValue?: string[];
	value?: string[];
	onValueChange?: (value: string[]) => void;
	children: React.ReactNode;
	className?: string;
}

function Accordion({
	defaultValue = [],
	value: controlledValue,
	onValueChange,
	children,
	className,
}: AccordionProps) {
	const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
		() => new Set(defaultValue)
	);

	const openItems = React.useMemo(
		() => (controlledValue ? new Set(controlledValue) : uncontrolledOpen),
		[controlledValue, uncontrolledOpen]
	);

	const toggle = React.useCallback(
		(itemValue: string) => {
			if (controlledValue && onValueChange) {
				const next = new Set(controlledValue);
				if (next.has(itemValue)) next.delete(itemValue);
				else next.add(itemValue);
				onValueChange([...next]);
			} else {
				setUncontrolledOpen((prev) => {
					const next = new Set(prev);
					if (next.has(itemValue)) next.delete(itemValue);
					else next.add(itemValue);
					return next;
				});
			}
		},
		[controlledValue, onValueChange]
	);

	const ctxValue = React.useMemo(
		() => ({ openItems, toggle }),
		[openItems, toggle]
	);

	return (
		<AccordionContext.Provider value={ctxValue}>
			<div data-slot="accordion" className={className}>
				{children}
			</div>
		</AccordionContext.Provider>
	);
}

// ── AccordionItem ────────────────────────────────────────────────────────────

interface AccordionItemProps {
	value: string;
	children: React.ReactNode;
	className?: string;
	disabled?: boolean;
}

function AccordionItem({
	value,
	children,
	className,
	disabled,
}: AccordionItemProps) {
	const { openItems } = useAccordionContext();
	const isOpen = openItems.has(value);

	return (
		<AccordionItemContext.Provider value={value}>
			<div
				data-slot="accordion-item"
				data-state={isOpen ? "open" : "closed"}
				data-disabled={disabled || undefined}
				className={cn("border-b last:border-b-0", className)}
			>
				{children}
			</div>
		</AccordionItemContext.Provider>
	);
}

// ── AccordionTrigger ─────────────────────────────────────────────────────────

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	className?: string;
}

function AccordionTrigger({
	className,
	children,
	...props
}: AccordionTriggerProps) {
	const { openItems, toggle } = useAccordionContext();
	const itemValue = React.useContext(AccordionItemContext);
	const isOpen = openItems.has(itemValue);

	return (
		<div className="flex">
			<button
				type="button"
				data-slot="accordion-trigger"
				data-state={isOpen ? "open" : "closed"}
				aria-expanded={isOpen}
				className={cn(
					"focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
					className
				)}
				onClick={() => toggle(itemValue)}
				{...props}
			>
				{children}
				<ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
			</button>
		</div>
	);
}

// ── AccordionContent ─────────────────────────────────────────────────────────

interface AccordionContentProps {
	children: React.ReactNode;
	className?: string;
}

function AccordionContent({ className, children }: AccordionContentProps) {
	const { openItems } = useAccordionContext();
	const itemValue = React.useContext(AccordionItemContext);
	const isOpen = openItems.has(itemValue);

	const contentRef = React.useRef<HTMLDivElement>(null);
	const innerRef = React.useRef<HTMLDivElement>(null);
	const [height, setHeight] = React.useState<number | undefined>(
		isOpen ? undefined : 0
	);
	const [shouldRender, setShouldRender] = React.useState(isOpen);
	const isFirstRender = React.useRef(true);

	React.useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			if (isOpen) {
				// eslint-disable-next-line react-hooks/set-state-in-effect -- animation lifecycle
				setShouldRender(true);
				setHeight(undefined);
			}
			return;
		}

		if (isOpen) {
			// Opening: render content, then measure and animate
			setShouldRender(true);
			// Start from 0
			setHeight(0);
			requestAnimationFrame(() => {
				if (innerRef.current) {
					const measured = innerRef.current.scrollHeight;
					setHeight(measured);
				}
			});
		} else {
			// Closing: set explicit height first, then animate to 0
			if (innerRef.current) {
				const measured = innerRef.current.scrollHeight;
				setHeight(measured);
				requestAnimationFrame(() => {
					setHeight(0);
				});
			}
		}
	}, [isOpen]);

	const handleTransitionEnd = React.useCallback(() => {
		if (isOpen) {
			// After opening, remove explicit height so content can resize naturally
			setHeight(undefined);
		} else {
			// After closing, unmount content
			setShouldRender(false);
		}
	}, [isOpen]);

	return (
		<div
			ref={contentRef}
			data-slot="accordion-content"
			data-state={isOpen ? "open" : "closed"}
			className="overflow-hidden text-sm"
			style={{
				height: height === undefined ? "auto" : `${height}px`,
				transition: "height 200ms ease-out, opacity 150ms ease-out",
				opacity: isOpen || height !== 0 ? 1 : 0,
			}}
			onTransitionEnd={handleTransitionEnd}
		>
			<div ref={innerRef} className={cn("pt-0 pb-4", className)}>
				{shouldRender && children}
			</div>
		</div>
	);
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
