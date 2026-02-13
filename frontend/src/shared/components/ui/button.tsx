import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "./custom/buttonVariants";
import { Loader2 } from "lucide-react";

export interface ButtonProps
	extends React.ComponentProps<"button">,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	isLoading?: boolean;
}

function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	isLoading = false,
	disabled,
	children,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(
				buttonVariants({ variant, size, className }),
				"cursor-pointer"
			)}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading && <Loader2 className="animate-spin" />}
			{children}
		</Comp>
	);
}

export { Button };
