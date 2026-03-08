import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-6", className)}
			{...props}
		/>
	);
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			className={cn(
				"relative inline-flex h-10 w-fit items-center justify-center rounded-lg p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
				className
			)}
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	value,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	const [isHovered, setIsHovered] = React.useState(false);
	const [isActive, setIsActive] = React.useState(false);

	// Use a ref to track the element and check its data-state
	const triggerRef = React.useRef<HTMLButtonElement>(null);

	React.useEffect(() => {
		const checkActiveState = () => {
			if (triggerRef.current) {
				const state = triggerRef.current.getAttribute("data-state");
				setIsActive(state === "active");
			}
		};

		// Check immediately
		checkActiveState();

		// Set up a MutationObserver to watch for data-state changes
		const observer = new MutationObserver(checkActiveState);
		if (triggerRef.current) {
			observer.observe(triggerRef.current, {
				attributes: true,
				attributeFilter: ["data-state"],
			});
		}

		return () => observer.disconnect();
	}, []);

	return (
		<TabsPrimitive.Trigger
			ref={triggerRef}
			data-slot="tabs-trigger"
			value={value}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"relative cursor-pointer inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all duration-300",
				"text-gray-600 dark:text-gray-400",
				"hover:text-gray-900 dark:hover:text-gray-200",
				"data-[state=active]:text-[#62a0f2] dark:data-[state=active]:text-[#62a0f2]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
				"disabled:pointer-events-none disabled:opacity-50",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		>
			{/* Background for active state with clip-path animation */}
			<motion.div
				className="absolute inset-0 rounded-md bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700"
				initial={false}
				animate={{
					clipPath: isActive
						? "inset(0% 0% 0% 0% round 6px)"
						: "inset(50% 50% 50% 50% round 6px)",
					opacity: isActive ? 1 : 0,
				}}
				transition={{
					duration: 0.4,
					ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier for smooth animation
				}}
			/>

			{/* Hover effect */}
			<motion.div
				className="absolute inset-0 rounded-md bg-gray-200/50 dark:bg-gray-700/50"
				initial={false}
				animate={{
					opacity: isHovered && !isActive ? 1 : 0,
				}}
				transition={{
					duration: 0.2,
					ease: "easeInOut",
				}}
			/>

			{/* Content */}
			<span className="relative z-10">{props.children}</span>
		</TabsPrimitive.Trigger>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	// Use the value prop to create a unique key for animation
	const contentKey = props.value || "default";

	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("flex-1 outline-none", className)}
			{...props}
		>
			<motion.div
				key={contentKey}
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					duration: 0.5,
					ease: [0.25, 0.1, 0.25, 1.0], // Custom cubic-bezier for elongated fade
				}}
			>
				{props.children}
			</motion.div>
		</TabsPrimitive.Content>
	);
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
