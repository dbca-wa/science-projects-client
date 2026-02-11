import { forwardRef } from "react";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/components/ui/custom/buttonVariants";
import { type VariantProps } from "class-variance-authority";
import { useNavigationHandler } from "@/shared/hooks/useNavigationHandler";

interface NavigationButtonProps extends VariantProps<typeof buttonVariants> {
	targetPath: string;
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
}

/**
 * NavigationButton - Enhanced button component with Ctrl+Click support
 *
 * Uses <a> tag with href to enable natural browser Ctrl+Click behavior
 * while intercepting standard clicks for React Router navigation.
 */
export const NavigationButton = forwardRef<
	HTMLAnchorElement,
	NavigationButtonProps
>(
	(
		{
			targetPath,
			onClick: onStandardNavigation,
			children,
			className,
			variant,
			size,
			...props
		},
		ref
	) => {
		const handleClick = useNavigationHandler(targetPath, onStandardNavigation);

		return (
			<a
				ref={ref}
				href={targetPath}
				onClick={handleClick}
				className={cn(
					"no-underline cursor-pointer",
					buttonVariants({ variant, size, className })
				)}
				{...props}
			>
				{children}
			</a>
		);
	}
);

NavigationButton.displayName = "NavigationButton";
