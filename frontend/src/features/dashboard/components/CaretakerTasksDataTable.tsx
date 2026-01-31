import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import type { IAdminTask } from "../types/admin-tasks.types";
import { formatCaretakerReason } from "../utils/dashboard.utils";

interface CaretakerTasksDataTableProps {
	tasks: IAdminTask[];
}

export const CaretakerTasksDataTable = ({ tasks }: CaretakerTasksDataTableProps) => {
	const navigate = useNavigate();

	const handleRowClick = (e: React.MouseEvent) => {
		if (e.ctrlKey || e.metaKey) {
			window.open("/admin", "_blank");
		} else {
			navigate("/admin");
		}
	};

	const [sorting, setSorting] = useState<{ column: "user" | "caretaker"; direction: "asc" | "desc" }>({
		column: "user",
		direction: "asc",
	});

	const sortedTasks = [...tasks].sort((a, b) => {
		if (sorting.column === "user") {
			const nameA = a.primary_user
				? `${a.primary_user.display_first_name} ${a.primary_user.display_last_name}`
				: "";
			const nameB = b.primary_user
				? `${b.primary_user.display_first_name} ${b.primary_user.display_last_name}`
				: "";
			const comparison = nameA.localeCompare(nameB);
			return sorting.direction === "asc" ? comparison : -comparison;
		} else {
			// Sort by caretaker
			const nameA = a.secondary_users?.[0]
				? `${a.secondary_users[0].display_first_name} ${a.secondary_users[0].display_last_name}`
				: "";
			const nameB = b.secondary_users?.[0]
				? `${b.secondary_users[0].display_first_name} ${b.secondary_users[0].display_last_name}`
				: "";
			const comparison = nameA.localeCompare(nameB);
			return sorting.direction === "asc" ? comparison : -comparison;
		}
	});

	const toggleSort = (column: "user" | "caretaker") => {
		setSorting(prev => ({
			column,
			direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
		}));
	};

	const UserSortIcon = sorting.column === "user" 
		? (sorting.direction === "asc" ? ArrowDown : ArrowUp)
		: ArrowDown;
	
	const CaretakerSortIcon = sorting.column === "caretaker"
		? (sorting.direction === "asc" ? ArrowDown : ArrowUp)
		: ArrowDown;

	if (tasks.length === 0) {
		return (
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
				<div className="text-gray-500 dark:text-gray-400">
					No pending caretaker requests.
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			{/* Header - hidden on mobile */}
			<div className="hidden md:grid grid-cols-[1fr_1fr_1fr] gap-4 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700">
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("user")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-green-600 dark:hover:text-green-400 transition-colors"
					>
						For (User)
						<UserSortIcon className="h-4 w-4" />
					</button>
				</div>
				<div className="px-4 py-3">
					<button
						onClick={() => toggleSort("caretaker")}
						className="flex items-center gap-2 font-semibold text-sm hover:text-green-600 dark:hover:text-green-400 transition-colors"
					>
						Proposed Caretaker
						<CaretakerSortIcon className="h-4 w-4" />
					</button>
				</div>
				<div className="px-4 py-3 font-semibold text-sm">
					Details
				</div>
			</div>

			{/* Mobile header - visible only on mobile */}
			<div className="md:hidden bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
				<button
					onClick={() => toggleSort("user")}
					className="flex items-center gap-2 font-semibold text-sm hover:text-green-600 dark:hover:text-green-400 transition-colors"
				>
					For (User)
					<UserSortIcon className="h-4 w-4" />
				</button>
			</div>

			{/* Rows */}
			<div>
				{sortedTasks.map((task) => {
					const primaryUser = task.primary_user;
					const caretaker = task.secondary_users?.[0];
					const formattedDate = format(new Date(task.created_at), "MMM d, yyyy 'at' h:mm a");
					
					return (
						<div
							key={task.id}
							onClick={(e) => handleRowClick(e)}
							className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr] gap-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors"
						>
							{/* User column - hidden on mobile */}
							<div className="hidden md:block px-4 py-4">
								{primaryUser ? (
									<>
										<div className="font-semibold text-green-600 dark:text-green-400 break-words">
											{primaryUser.display_first_name} {primaryUser.display_last_name}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 break-words">
											{primaryUser.email}
										</div>
									</>
								) : (
									<div className="text-gray-500">N/A</div>
								)}
							</div>

							{/* Caretaker column - hidden on mobile */}
							<div className="hidden md:block px-4 py-4">
								{caretaker ? (
									<>
										<div className="font-semibold text-blue-600 dark:text-blue-400 break-words">
											{caretaker.display_first_name} {caretaker.display_last_name}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 break-words">
											{caretaker.email}
										</div>
									</>
								) : (
									<div className="text-gray-500">N/A</div>
								)}
							</div>

							{/* Details column */}
							<div className="px-4 py-4 space-y-3">
								{/* User info - visible only on mobile */}
								{primaryUser && (
									<div className="md:hidden">
										<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
											For (User)
										</div>
										<div className="font-semibold text-green-600 dark:text-green-400 break-words">
											{primaryUser.display_first_name} {primaryUser.display_last_name}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 break-words">
											{primaryUser.email}
										</div>
									</div>
								)}

								{/* Caretaker info - visible only on mobile */}
								{caretaker && (
									<div className="md:hidden">
										<div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
											Proposed Caretaker
										</div>
										<div className="font-semibold text-blue-600 dark:text-blue-400 break-words">
											{caretaker.display_first_name} {caretaker.display_last_name}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400 break-words">
											{caretaker.email}
										</div>
									</div>
								)}

								{/* Reason */}
								{task.reason && (
									<div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
										{formatCaretakerReason(task.reason)}
									</div>
								)}
								
								{/* Notes */}
								{task.notes && (
									<div className="text-sm text-gray-600 dark:text-gray-400 break-words">
										Note: {task.notes}
									</div>
								)}
								
								{/* Requester and date */}
								<div className="text-xs text-gray-500 dark:text-gray-500 break-words">
									Requested by {task.requester.display_first_name} {task.requester.display_last_name} on {formattedDate}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
