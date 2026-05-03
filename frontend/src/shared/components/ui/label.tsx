import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/shared/lib/utils";

function Label({
	className,
	htmlFor,
	onClick,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
	const [isSelectLabel, setIsSelectLabel] = React.useState(false);

	// On mount, check if the htmlFor target is a select trigger
	React.useEffect(() => {
		if (!htmlFor) return;
		const raf = requestAnimationFrame(() => {
			const target = document.getElementById(htmlFor);
			if (target?.getAttribute("data-slot") === "select-trigger") {
				setIsSelectLabel(true);
			}
		});
		return () => cancelAnimationFrame(raf);
	}, [htmlFor]);

	return (
		<LabelPrimitive.Root
			data-slot="label"
			className={cn(
				"flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
				className
			)}
			// For select triggers: remove htmlFor so clicking the label does nothing.
			// This avoids the Radix Select positioning bug where the popover opens
			// at the top-left of the viewport instead of the trigger.
			// Programmatic .click() on the trigger also doesn't work — Radix needs
			// a real user click on the trigger element for correct positioning.
			htmlFor={isSelectLabel ? undefined : htmlFor}
			onClick={onClick}
			{...props}
		/>
	);
}

export { Label };
