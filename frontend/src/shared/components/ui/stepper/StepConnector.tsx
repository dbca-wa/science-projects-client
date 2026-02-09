import { cn } from "@/shared/lib/utils";

export interface StepConnectorProps {
	isCompleted: boolean;
	orientation?: "horizontal" | "vertical";
	className?: string;
}

export const StepConnector = ({
	isCompleted,
	orientation = "horizontal",
	className,
}: StepConnectorProps) => {
	const isHorizontal = orientation === "horizontal";

	return (
		<div
			className={cn(
				"transition-all duration-500 ease-out",
				isHorizontal
					? "mx-2 h-1 flex-1 sm:mx-4 rounded-full"
					: "ml-5 h-8 w-1 sm:ml-0 sm:mr-4 rounded-full",
				isCompleted ? "bg-emerald-500 dark:bg-emerald-400" : "bg-gray-200 dark:bg-gray-700",
				isHorizontal ? "hidden sm:block" : "block",
				className,
			)}
			role="separator"
			aria-hidden="true"
		/>
	);
};
