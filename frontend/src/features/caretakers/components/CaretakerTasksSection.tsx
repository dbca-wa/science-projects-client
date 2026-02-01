import { useState } from "react";
import { ChevronDown, ChevronUp, Users, AlertCircle } from "lucide-react";
import { useCaretakerTasks } from "../hooks/useCaretakerTasks";
import { CaretakerDocumentTasksDataTable } from "./CaretakerDocumentTasksDataTable";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface CaretakerTasksSectionProps {
	userId: number;
}

/**
 * Section component for displaying caretaker tasks on the dashboard
 * Shows tasks for all users the current user is caretaking for
 */
export const CaretakerTasksSection = ({ userId }: CaretakerTasksSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const { data: caretakerTasks, isLoading, isError, error, refetch } = useCaretakerTasks(userId);

	// Calculate total task count
	const totalTasks = caretakerTasks?.all?.length || 0;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-6 w-8 rounded-full" />
					</div>
					<Skeleton className="h-6 w-6" />
				</div>
				<Skeleton className="h-32 w-full" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Users className="size-5 text-blue-600 dark:text-blue-400" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Caretaker Tasks
					</h3>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription className="flex items-center justify-between">
						<span>Failed to load caretaker tasks: {error?.message || "Unknown error"}</span>
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
						>
							Retry
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Don't show section if no tasks
	if (totalTasks === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			{/* Section Header */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full flex items-center justify-between group"
			>
				<div className="flex items-center gap-2">
					<Users className="size-5 text-blue-600 dark:text-blue-400" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Caretaker Tasks
					</h3>
					{totalTasks > 0 && (
						<span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-blue-600 rounded-full">
							{totalTasks}
						</span>
					)}
				</div>
				{isExpanded ? (
					<ChevronUp className="size-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
				) : (
					<ChevronDown className="size-5 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
				)}
			</button>

			{/* Description */}
			{isExpanded && (
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Showing tasks for users you're caretaking for
				</p>
			)}

			{/* Tasks Table */}
			{isExpanded && (
				<CaretakerDocumentTasksDataTable
					teamTasks={caretakerTasks?.team || []}
					leadTasks={caretakerTasks?.lead || []}
					baTasks={caretakerTasks?.ba || []}
					directorateTasks={caretakerTasks?.directorate || []}
				/>
			)}
		</div>
	);
};
