import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";

import { cn } from "@/shared/lib/utils";

function Accordion({
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
	return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
	className,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
	return (
		<AccordionPrimitive.Item
			data-slot="accordion-item"
			className={cn("border-b last:border-b-0", className)}
			{...props}
		/>
	);
}

function AccordionTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
	return (
		<AccordionPrimitive.Header className="flex">
			<AccordionPrimitive.Trigger
				data-slot="accordion-trigger"
				className={cn(
					"flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
					className
				)}
				{...props}
			>
				{children}
				<ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200" />
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	);
}

/**
 * Stable wrapper that prevents children from re-rendering during
 * accordion open/close animations. MobX observer() on parent components
 * can trigger re-renders mid-animation, which causes Radix's internal
 * Presence component to re-measure content height and flash.
 */
const StableContent = React.memo(
	({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => <div className={cn("pt-0 pb-4", className)}>{children}</div>
);
StableContent.displayName = "StableContent";

/**
 * AccordionContent with MobX-safe animation handling.
 *
 * The flicker occurs because Radix's internal Presence component runs a
 * useLayoutEffect that temporarily removes the CSS animation to measure
 * content height. When MobX triggers a re-render during the close animation,
 * this effect re-runs mid-transition, causing a visible flash.
 *
 * Fix: The StableContent wrapper uses React.memo to prevent children from
 * re-rendering during animation. Combined with overflow:hidden (inline style
 * to survive re-renders) and animation-fill-mode:forwards (persists final
 * animation state), this eliminates the flicker.
 */
function AccordionContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
	return (
		<AccordionPrimitive.Content
			data-slot="accordion-content"
			className="text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
			style={{ overflow: "hidden" }}
			{...props}
		>
			<StableContent className={className}>{children}</StableContent>
		</AccordionPrimitive.Content>
	);
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
