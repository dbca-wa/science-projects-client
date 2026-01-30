import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useNavigationHandler } from "@/shared/hooks/useNavigationHandler";

interface DashboardActionCardProps {
	icon: ReactNode;
	title: string;
	description: string;
	onClick?: () => void;
	href?: string;
	targetPath?: string; // New prop for internal navigation
	colorScheme?: "blue" | "green" | "purple";
	delay?: number;
}

/**
 * DashboardActionCard component
 * Reusable card for dashboard quick actions
 */
export const DashboardActionCard = ({
	icon,
	title,
	description,
	onClick,
	href,
	targetPath, // New prop for navigation path
	colorScheme = "blue",
	delay = 0,
}: DashboardActionCardProps) => {
	const handleClick = useNavigationHandler(targetPath || '', onClick);
	const colorClasses = {
		blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
		green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
		purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
	};

	const content = (
		<div className="flex items-center space-x-3 overflow-hidden">
			<div className={`p-2 rounded-lg flex-shrink-0 ${colorClasses[colorScheme]}`}>
				{icon}
			</div>
			<div className="flex-1 min-w-0 overflow-hidden">
				<h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
					{title}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400 truncate">
					{description}
				</p>
			</div>
		</div>
	);

	const cardClasses = "cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700";

	if (href && !targetPath) {
		// External link - use existing behavior
		return (
			<motion.a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay }}
				className={cardClasses}
			>
				{content}
			</motion.a>
		);
	}

	return (
		<motion.a
			href={targetPath || '#'}
			onClick={targetPath ? handleClick : onClick}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className={`${cardClasses} text-left w-full block no-underline`}
		>
			{content}
		</motion.a>
	);
};