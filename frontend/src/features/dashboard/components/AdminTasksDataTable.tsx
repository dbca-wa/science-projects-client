/**
 * AdminTasksDataTable Component
 * 
 * Displays admin tasks using the generic DataTable.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { format } from "date-fns";
import type { IAdminTask } from "../types/admin-tasks.types";
import { buildAdminTaskDetails, extractTextFromHTML } from "../utils/dashboard.utils";

interface AdminTasksDataTableProps {
	tasks: IAdminTask[];
}

export const AdminTasksDataTable = ({ tasks }: AdminTasksDataTableProps) => {
	const navigate = useNavigate();

	// Column definitions
	const columns: ColumnDef<IAdminTask>[] = useMemo(
		() => [
			{
				id: "requester",
				header: "Requester",
				accessor: (row) =>
					`${row.requester.display_first_name} ${row.requester.display_last_name}`,
				cell: (row) => (
					<div>
						<div className="font-semibold text-blue-600 dark:text-blue-400">
							{row.requester.display_first_name} {row.requester.display_last_name}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							{row.requester.email}
						</div>
					</div>
				),
				sortable: true,
				sortFn: (a, b) => {
					const nameA = `${a.requester.display_first_name} ${a.requester.display_last_name}`;
					const nameB = `${b.requester.display_first_name} ${b.requester.display_last_name}`;
					return nameA.localeCompare(nameB);
				},
				width: "250px",
			},
			{
				id: "details",
				header: "Details",
				accessor: (row) => buildAdminTaskDetails(row),
				cell: (row) => {
					const formattedDate = format(new Date(row.created_at), "MMM d, yyyy 'at' h:mm a");
					const detailText = buildAdminTaskDetails(row);

					return (
						<div className="space-y-1">
							<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
								{detailText}
							</div>
							{row.notes && (
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Note: {row.notes}
								</div>
							)}
							{row.action === "deleteproject" && row.project && (
								<div className="text-xs text-red-600 dark:text-red-400 font-semibold">
									Project: {extractTextFromHTML(row.project.title)} (ID: {row.project.id})
								</div>
							)}
							<div className="text-xs text-gray-500 dark:text-gray-500">
								Requested on {formattedDate}
							</div>
						</div>
					);
				},
				sortable: false,
			},
		],
		[]
	);

	// Handle row click - navigate to admin
	const handleRowClick = (_task: IAdminTask, event: React.MouseEvent) => {
		if (event.ctrlKey || event.metaKey) {
			window.open("/admin", "_blank");
		} else {
			navigate("/admin");
		}
	};

	return (
		<DataTable
			data={tasks}
			columns={columns}
			getRowKey={(row) => row.id}
			onRowClick={handleRowClick}
			defaultSort={{ column: "requester", direction: "asc" }}
			emptyMessage="All done! No pending tasks."
			ariaLabel="Admin tasks"
		/>
	);
};
