/**
 * AdminCaretakerTasksDataTable Component
 * 
 * Displays caretaker approval requests (admin tasks) using the generic DataTable.
 * Shows requests for users to become caretakers for other users.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { format } from "date-fns";
import type { IAdminTask } from "@/features/dashboard/types/admin-tasks.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { getImageUrl } from "@/shared/utils/image.utils";

interface AdminCaretakerTasksDataTableProps {
	tasks: IAdminTask[];
}

export const AdminCaretakerTasksDataTable = ({ tasks }: AdminCaretakerTasksDataTableProps) => {
	const navigate = useNavigate();

	// Column definitions
	const columns: ColumnDef<IAdminTask>[] = useMemo(
		() => [
			{
				id: "requester",
				header: "Caretaker",
				accessor: (row) =>
					`${row.requester.display_first_name} ${row.requester.display_last_name}`,
				cell: (row) => (
					<div className="flex items-center gap-3">
						<Avatar className="size-10">
							<AvatarImage src={getImageUrl(row.requester.image)} />
							<AvatarFallback>
								{row.requester.display_first_name[0]}
								{row.requester.display_last_name[0]}
							</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-semibold text-gray-900 dark:text-gray-100">
								{row.requester.display_first_name} {row.requester.display_last_name}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								{row.requester.email}
							</div>
						</div>
					</div>
				),
				sortable: true,
				sortFn: (a, b) => {
					const nameA = `${a.requester.display_first_name} ${a.requester.display_last_name}`;
					const nameB = `${b.requester.display_first_name} ${b.requester.display_last_name}`;
					return nameA.localeCompare(nameB);
				},
			},
			{
				id: "user",
				header: "For User",
				accessor: (row) =>
					row.primary_user
						? `${row.primary_user.display_first_name} ${row.primary_user.display_last_name}`
						: "",
				cell: (row) => {
					const formattedDate = format(new Date(row.created_at), "MMM d, yyyy");
					const startDate = row.start_date
						? format(new Date(row.start_date), "MMM d, yyyy")
						: null;
					const endDate = row.end_date
						? format(new Date(row.end_date), "MMM d, yyyy")
						: null;

					return (
						<div>
							{row.primary_user ? (
								<div className="flex items-center gap-3">
									<Avatar className="size-10">
										<AvatarImage src={getImageUrl(row.primary_user.image)} />
										<AvatarFallback>
											{row.primary_user.display_first_name[0]}
											{row.primary_user.display_last_name[0]}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-semibold text-gray-900 dark:text-gray-100">
											{row.primary_user.display_first_name}{" "}
											{row.primary_user.display_last_name}
										</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											{row.primary_user.email}
										</div>
									</div>
								</div>
							) : (
								<div className="text-sm text-gray-500 dark:text-gray-400">
									No user specified
								</div>
							)}

							{/* Details section - visible only on mobile */}
							<div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
								<div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
									Details
								</div>
								<div className="space-y-2">
									{row.reason && (
										<div>
											<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
												Reason:
											</div>
											<div className="text-sm text-gray-900 dark:text-gray-100">
												{row.reason}
											</div>
										</div>
									)}
									<div>
										<div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
											Requested by:
										</div>
										<div className="text-sm text-gray-900 dark:text-gray-100">
											{row.requester.display_first_name} {row.requester.display_last_name}
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
					);
				},
				sortable: true,
				sortFn: (a, b) => {
					const nameA = a.primary_user
						? `${a.primary_user.display_first_name} ${a.primary_user.display_last_name}`
						: "";
					const nameB = b.primary_user
						? `${b.primary_user.display_first_name} ${b.primary_user.display_last_name}`
						: "";
					return nameA.localeCompare(nameB);
				},
			},
		],
		[]
	);

	// Handle row click - navigate to caretaker task
	const handleRowClick = (task: IAdminTask, event: React.MouseEvent) => {
		const url = `/?caretaker_task=${task.id}`;

		if (event.ctrlKey || event.metaKey) {
			window.open(url, "_blank");
		} else {
			navigate(url);
		}
	};

	return (
		<DataTable
			data={tasks}
			columns={columns}
			getRowKey={(row) => row.id}
			onRowClick={handleRowClick}
			defaultSort={{ column: "requester", direction: "asc" }}
			emptyMessage="No pending caretaker tasks."
			ariaLabel="Admin caretaker tasks"
		/>
	);
};
