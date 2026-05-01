import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface FormPreviewToggleProps {
	showPreview: boolean;
	onShowForm: () => void;
	onShowPreview: () => void;
}

/**
 * Animated Form/Preview toggle button pair.
 * Used by the project creation wizard and the new cycle page.
 * Hidden on ultra-wide screens (≥3xl) where both panels are visible.
 */
export const FormPreviewToggle = ({
	showPreview,
	onShowForm,
	onShowPreview,
}: FormPreviewToggleProps) => {
	return (
		<div className="3xl:hidden shrink-0">
			<div className="relative inline-flex h-11 items-center justify-center rounded-xl p-1.5 bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 backdrop-blur-xl border border-blue-200/60 dark:border-blue-700/40 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20">
				<motion.div
					className="absolute h-8 rounded-lg"
					initial={false}
					animate={{
						x: showPreview ? "100%" : "0%",
					}}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 30,
					}}
					style={{
						left: "6px",
						top: "6px",
						width: "calc(50% - 6px)",
						background:
							"linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.2) 100%)",
						backdropFilter: "blur(16px) saturate(180%)",
						WebkitBackdropFilter: "blur(16px) saturate(180%)",
						border: "1px solid rgba(59, 130, 246, 0.3)",
						boxShadow:
							"0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(59, 130, 246, 0.1)",
					}}
				/>

				<button
					type="button"
					onClick={onShowForm}
					className={cn(
						"relative z-10 inline-flex h-8 min-w-[80px] items-center justify-center rounded-lg px-5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
						!showPreview
							? "text-blue-600 dark:text-blue-400"
							: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					)}
					aria-pressed={!showPreview}
					aria-label="Show form view"
				>
					Form
				</button>

				<button
					type="button"
					onClick={onShowPreview}
					className={cn(
						"relative z-10 inline-flex h-8 min-w-[80px] items-center justify-center rounded-lg px-5 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
						showPreview
							? "text-blue-600 dark:text-blue-400"
							: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
					)}
					aria-pressed={showPreview}
					aria-label="Show preview"
				>
					Preview
				</button>
			</div>
		</div>
	);
};
