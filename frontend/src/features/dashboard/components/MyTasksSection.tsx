import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminTasksDataTable } from "./AdminTasksDataTable";
import { CaretakerTasksDataTable } from "./CaretakerTasksDataTable";
import {
	filterCaretakerTasks,
	filterAdminTasks,
} from "../utils/dashboard.utils";
import type { MyTasksSectionPhase1Props } from "../types/admin-tasks.types";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Collapsible section for task groups
 */
const TaskSection = ({
	title,
	count,
	children,
	defaultOpen = true,
}: {
	title: string;
	count: number;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="mb-6">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
			>
				<div className="flex items-center gap-3">
					{isOpen ? (
						<ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					) : (
						<ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					)}
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{title}
					</h3>
					<span className="inline-flex items-center justify-center px-2.5 py-1 text-sm font-bold leading-none text-white bg-blue-600 rounded-full">
						{count}
					</span>
				</div>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<div className="pt-4">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export const MyTasksSection = ({
	adminTasks,
	adminTasksLoading,
	adminTasksError,
	refetchAdminTasks,
}: MyTasksSectionPhase1Props) => {
	if (adminTasksLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
			</div>
		);
	}

	if (adminTasksError) {
		return (
			<div className="text-center py-8">
				<p className="text-red-600 dark:text-red-400 mb-4">
					Failed to load tasks: {adminTasksError.message || "Unknown error"}
				</p>
				{refetchAdminTasks && (
					<button
						onClick={() => refetchAdminTasks()}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Retry
					</button>
				)}
			</div>
		);
	}

	const totalTasks = adminTasks.length;

	if (totalTasks === 0) {
		return (
			<div className="w-full h-full">
				<p className="text-gray-600 dark:text-gray-400 text-center py-8">
					Your tasks will be shown here...
				</p>
			</div>
		);
	}

	const caretakerTasks = filterCaretakerTasks(adminTasks);
	const nonCaretakerAdminTasks = filterAdminTasks(adminTasks);

	return (
		<div className="flex flex-col w-full h-full">
			{caretakerTasks.length > 0 && (
				<TaskSection
					title="Caretaker Requests"
					count={caretakerTasks.length}
					defaultOpen={true}
				>
					<CaretakerTasksDataTable tasks={caretakerTasks} />
				</TaskSection>
			)}

			{nonCaretakerAdminTasks.length > 0 && (
				<TaskSection
					title="Admin Tasks"
					count={nonCaretakerAdminTasks.length}
					defaultOpen={true}
				>
					<AdminTasksDataTable tasks={nonCaretakerAdminTasks} />
				</TaskSection>
			)}

			{/* TODO: Add document tasks section when projects feature is implemented */}
			<div className="mt-4 p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
				<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
					Document Tasks
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Will be available after Projects feature is implemented.
				</p>
				<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
					This section will include: Concept Plans, Project Plans,
					Progress Reports, Student Reports, and Project Closures.
				</p>
			</div>

			{/* TODO: Add endorsement tasks section when projects feature is implemented */}
			<div className="mt-4 p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
				<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
					Endorsement Tasks
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Will be available after Projects feature is implemented.
				</p>
				<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
					This section will include: AEC, Biometrician, and Herbarium
					Curator endorsements.
				</p>
			</div>
		</div>
	);
};
