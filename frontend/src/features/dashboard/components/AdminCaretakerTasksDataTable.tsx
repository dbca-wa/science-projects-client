import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import type { IAdminTask } from "../types/admin-tasks.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { getImageUrl } from "@/shared/utils/image.utils";

interface AdminCaretakerTasksDataTableProps {
	tasks: IAdminTask[];
}

/**
 * Data table for displaying caretaker approval requests (admin tasks)
 * Shows requests for users to become caretakers for other users
 */
export const AdminCaretakerTasksDataTable = ({ tasks }: AdminCaretakerTasksDataTableProps) => {
	const navigate = useNavigate();
	const [sorting, setSorting] = useState<{
		column: "requester" | "user";
		direction: "asc" | "desc";
	}>({
		column: "requester",
		direction: "asc",
	});

	const handleRowClick = (taskId: number, e: React.MouseEvent) => {
		const url = `/?caretaker_task=${taskId}`;

		if (e.ctrlKey || e.metaKey) {
			window.open(url, "_blank");
		} else {
			navigate(url);
		}
	};

	const sortedTasks = [...tasks].sort((a, b) => {
		if (sorting.column === "requester") {
			const nameA = `${a.requester.display_first_name} ${a.requester.display_last_name}`;
			const nameB = `${b.requester.display_first_name} ${b.requester.display_last_name}`;
			const comparison = nameA.localeCompare(nameB);
			return sorting.direction === "asc" ? comparison : -comparison;
		} else {
			// Sort by primary user
			const nameA = a.primary_user
				? `${a.primary_user.display_first_name} ${a.primary_user.display_last_name}`
				: "";
			const nameB = b.primary_user
				? `${b.primary_user.display_first_name} ${b.primary_user.display_last_name}`
				: "";
			const comparison = nameA.localeCompare(nameB);
			return sorting.direction === "asc" ? comparison : -comparison;
		}
	});

	const toggleSort = (column: "requester" | "user") => {
		setSorting((prev) => ({
			column,
			direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const RequesterSortIcon =
		sorting.column === "requester"
			? sorting.direction === "asc"
				? ArrowDown
				: ArrowUp
			: ArrowDown;

	const UserSortIcon =
		sorting.column === "user"
			? sorting.direction === "asc"
				? ArrowDown
				: ArrowUp
			: ArrowDown;

	if (tasks.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
				<div className="text-gray-500 dark:text-gray-400">
					No pending caretaker tasks.
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			{/* Header - hidden on mobile */}
			<div className="hidden md:grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("requester")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						Caretaker
						<RequesterSortIcon className="h-4 w-4" />
					</button>
				</div>
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("user")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						For User
						<UserSortIcon className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Mobile header - visible only on mobile */}
			<div className="md:hidden bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
				<button
					onClick={() => toggleSort("requester")}
					className="flex items-center gap-2 font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
				>
					Caretaker
					<RequesterSortIcon className="h-4 w-4" />
				</button>
			</div>

			{/* Rows */}
			<div>
				{sortedTasks.map((task) => {
					const formattedDate = format(new Date(task.created_at), "MMM d, yyyy");
					const startDate = task.start_date
						? format(new Date(task.start_date), "MMM d, yyyy")
						: null;
					const endDate = task.end_date ? format(new Date(task.end_date), "MMM d, yyyy") : null;

					return (
						<div
							key={task.id}
							onClick={(e) => handleRowClick(task.id, e)}
							className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
						>
							{/* Caretaker column */}
							<div className="px-4 py-4">
								<div className="md:hidden text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
									Caretaker
								</div>
								<div className="flex items-center gap-3">
									<Avatar className="size-10">
										<AvatarImage src={getImageUrl(task.requester.image)} />
										<AvatarFallback>
											{task.requester.display_first_name[0]}
											{task.requester.display_last_name[0]}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-semibold text-gray-900 dark:text-gray-100">
											{task.requester.display_first_name} {task.requester.display_last_name}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											{task.requester.email}
										</div>
									</div>
								</div>
							</div>

							{/* For User column */}
							<div className="px-4 py-4">
								<div className="md:hidden text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
									For User
								</div>
								{task.primary_user ? (
									<div className="flex items-center gap-3">
										<Avatar className="size-10">
											<AvatarImage src={getImageUrl(task.primary_user.image)} />
											<AvatarFallback>
												{task.primary_user.display_first_name[0]}
												{task.primary_user.display_last_name[0]}
											</AvatarFallback>
										</Avatar>
										<div>
											<div className="font-semibold text-gray-900 dark:text-gray-100">
												{task.primary_user.display_first_name}{" "}
												{task.primary_user.display_last_name}
											</div>
											<div className="text-sm text-gray-600 dark:text-gray-400">
												{task.primary_user.email}
											</div>
										</div>
									</div>
								) : (
									<div className="text-sm text-gray-500 dark:text-gray-400">No user specified</div>
								)}
								
								{/* Details section - visible only on mobile */}
								<div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
									<div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
										Details
									</div>
									<div className="space-y-2">
										{task.reason && (
											<div>
												<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
													Reason:
												</div>
												<div className="text-sm text-gray-900 dark:text-gray-100">
													{task.reason}
												</div>
											</div>
										)}
										<div>
											<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
												Requested by:
											</div>
											<div className="text-sm text-gray-900 dark:text-gray-100">
												{task.requester.display_first_name} {task.requester.display_last_name}
											</div>
										</div>
										<div>
											<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
												Date requested:
											</div>
											<div className="text-sm text-gray-900 dark:text-gray-100">
												{formattedDate}
											</div>
										</div>
										{startDate && (
											<div>
												<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
													Start date:
												</div>
												<div className="text-sm text-gray-900 dark:text-gray-100">
													{startDate}
												</div>
											</div>
										)}
										{endDate && (
											<div>
												<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
													End date:
												</div>
												<div className="text-sm text-gray-900 dark:text-gray-100">
													{endDate}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
