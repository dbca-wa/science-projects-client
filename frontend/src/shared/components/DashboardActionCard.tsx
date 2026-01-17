import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface DashboardActionCardProps {
	icon: ReactNode;
	title: string;
	description: string;
	onClick?: () => void;
	href?: string;
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
	colorScheme = "blue",
	delay = 0,
}: DashboardActionCardProps) => {
	const colorClasses = {
		blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
		green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
		purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
	};

	const content = (
		<div className="cursor-pointer flex items-center space-x-3">
			<div className={`p-2 rounded-lg ${colorClasses[colorScheme]}`}>
				{icon}
			</div>
			<div>
				<h3 className="font-semibold text-gray-900 dark:text-gray-100">
					{title}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					{description}
				</p>
			</div>
		</div>
	);

	const cardClasses = "p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700";

	if (href) {
		return (
			<motion.a
				href={href}
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
		<motion.button
			onClick={onClick}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className={`${cardClasses} text-left w-full`}
		>
			{content}
		</motion.button>
	);
};
