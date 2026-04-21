import { cva } from "class-variance-authority";

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				// Action button variants - clean, borderless design
				"action-green":
					"bg-green-600 text-white hover:bg-green-700 font-semibold shadow-sm hover:shadow-md transition-all dark:bg-green-700 dark:hover:bg-green-800",
				"action-blue":
					"bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-sm hover:shadow-md transition-all dark:bg-blue-700 dark:hover:bg-blue-800",
				"action-orange":
					"bg-orange-600 text-white hover:bg-orange-700 font-semibold shadow-sm hover:shadow-md transition-all dark:bg-orange-700 dark:hover:bg-orange-800",
				"action-red":
					"bg-red-600 text-white hover:bg-red-700 font-semibold shadow-sm hover:shadow-md transition-all dark:bg-red-700 dark:hover:bg-red-800",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);
