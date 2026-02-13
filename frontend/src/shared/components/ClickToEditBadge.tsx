import { motion } from "framer-motion";

interface ClickToEditBadgeProps {
	isVisible: boolean;
}

export const ClickToEditBadge = ({ isVisible }: ClickToEditBadgeProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{
				opacity: isVisible ? 1 : 0,
				scale: isVisible ? 1 : 0.95,
			}}
			transition={{ duration: 0.2 }}
			className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 shadow-sm"
			style={{
				boxShadow: isVisible ? "0 0 12px rgba(59, 130, 246, 0.3)" : "none",
			}}
		>
			<svg
				className="size-3.5 text-blue-600 dark:text-blue-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
				/>
			</svg>
			<span className="text-xs font-medium text-blue-600 dark:text-blue-400">
				Click to edit
			</span>
		</motion.div>
	);
};
