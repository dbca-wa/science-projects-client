import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded border px-2.5 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
				destructive:
					"border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				// Document status variants
				draft:
					"border-transparent bg-slate-500 text-white [a&]:hover:bg-slate-600 dark:bg-slate-600",
				inreview:
					"border-transparent bg-blue-600 text-white [a&]:hover:bg-blue-700 dark:bg-blue-700",
				approved:
					"border-transparent bg-green-600 text-white [a&]:hover:bg-green-700 dark:bg-green-700",
				pending:
					"border-transparent bg-yellow-600 text-white [a&]:hover:bg-yellow-700 dark:bg-yellow-700",
				denied:
					"border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 dark:bg-red-700",
				// Project status variants (using Tailwind classes that match PROJECT_STATUS_COLORS)
				project_new:
					"border-transparent bg-slate-600 text-white [a&]:hover:bg-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_pending:
					"border-transparent bg-yellow-500 text-white [a&]:hover:bg-yellow-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_active:
					"border-transparent bg-green-600 text-white [a&]:hover:bg-green-700 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_updating:
					"border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_closure_requested:
					"border-transparent bg-orange-600 text-white [a&]:hover:bg-orange-700 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_closing:
					"border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_final_update:
					"border-transparent bg-red-600 text-white [a&]:hover:bg-red-700 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_completed:
					"border-transparent bg-green-700 text-white [a&]:hover:bg-green-800 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_terminated:
					"border-transparent bg-slate-800 text-white [a&]:hover:bg-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				project_suspended:
					"border-transparent bg-slate-600 text-white [a&]:hover:bg-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				// Project kind variants (using Tailwind classes that approximate PROJECT_KIND_COLORS)
				kind_science:
					"border-transparent bg-[#2A6096] text-white [a&]:hover:bg-[#234d78] shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				kind_core_function:
					"border-transparent bg-[#01A7B2] text-white [a&]:hover:bg-[#01868e] shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				kind_student:
					"border-transparent bg-[#FFC530] text-white [a&]:hover:bg-[#e6b02b] shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				kind_external:
					"border-transparent bg-[#1E5456] text-white [a&]:hover:bg-[#184345] shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				// Team role variants (matching original SPMS colors)
				role_research:
					"border-transparent bg-green-700 text-white [a&]:hover:bg-green-800 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_supervising:
					"border-transparent bg-orange-700 text-white [a&]:hover:bg-orange-800 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_academicsuper:
					"border-transparent bg-blue-500 text-white [a&]:hover:bg-blue-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_student:
					"border-transparent bg-blue-400 text-white [a&]:hover:bg-blue-500 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_technical:
					"border-transparent bg-orange-900 text-white [a&]:hover:bg-orange-950 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_consulted:
					"border-transparent bg-green-200 text-black [a&]:hover:bg-green-300 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_externalcol:
					"border-transparent bg-gray-200 text-black [a&]:hover:bg-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_externalpeer:
					"border-transparent bg-gray-300 text-black [a&]:hover:bg-gray-400 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
				role_group:
					"border-transparent bg-gray-500 text-white [a&]:hover:bg-gray-600 shadow-[0_1px_2px_rgba(0,0,0,0.3)] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp
			data-slot="badge"
			className={cn(
				badgeVariants({ variant }),
				"text-sm rounded-md",
				className
			)}
			{...props}
		/>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
