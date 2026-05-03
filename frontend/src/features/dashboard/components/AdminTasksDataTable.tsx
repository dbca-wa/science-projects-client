/**
 * AdminTasksDataTable Component
 *
 * Displays admin tasks (merge user requests) with approve/reject actions.
 * Merge tasks show both primary and secondary users with emails.
 * Approve action requires confirmation via AlertDialog.
 */

import { useMemo, useState } from "react";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { format } from "date-fns";
import type { IAdminTask } from "../types/admin-tasks.types";
import { buildAdminTaskDetails } from "../utils/dashboard.utils";
import { LINK_COLOR } from "@/shared/constants/colors";
import { Button } from "@/shared/components/ui/button";
import {
	useApproveAdminTask,
	useRejectAdminTask,
} from "@/shared/hooks/useAdminTaskActions";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/shared/components/ui/alert-dialog";

interface AdminTasksDataTableProps {
	tasks: IAdminTask[];
}

export const AdminTasksDataTable = ({ tasks }: AdminTasksDataTableProps) => {
	const approveMutation = useApproveAdminTask();
	const rejectMutation = useRejectAdminTask();

	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [taskToApprove, setTaskToApprove] = useState<IAdminTask | null>(null);

	const handleApproveClick = (task: IAdminTask) => {
		setTaskToApprove(task);
		setConfirmDialogOpen(true);
	};

	const handleConfirmApprove = () => {
		if (taskToApprove) {
			approveMutation.mutate(taskToApprove.id);
		}
		setConfirmDialogOpen(false);
		setTaskToApprove(null);
	};

	const columns: ColumnDef<IAdminTask>[] = useMemo(
		() => [
			{
				id: "requester",
				header: "Requester",
				accessor: (row) =>
					`${row.requester.display_first_name} ${row.requester.display_last_name}`,
				cell: (row) => (
					<div>
						<div className="font-semibold" style={{ color: LINK_COLOR }}>
							{row.requester.display_first_name}{" "}
							{row.requester.display_last_name}
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
				width: "200px",
			},
			{
				id: "details",
				header: "Details",
				accessor: (row) => buildAdminTaskDetails(row),
				cell: (row) => {
					const formattedDate = format(
						new Date(row.created_at),
						"MMM d, yyyy 'at' h:mm a"
					);

					if (row.action === "mergeuser" && row.secondary_users?.[0]) {
						const secondary = row.secondary_users[0];
						const primary = row.primary_user;

						return (
							<div className="space-y-1">
								<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
									Merge{" "}
									<span className="font-semibold">
										{secondary.display_first_name} {secondary.display_last_name}
									</span>{" "}
									into{" "}
									<span className="font-semibold">
										{primary
											? `${primary.display_first_name} ${primary.display_last_name}`
											: "requester's account"}
									</span>
								</div>
								<div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
									<div>Secondary: {secondary.email}</div>
									{primary && <div>Primary: {primary.email}</div>}
								</div>
								{row.reason && (
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Reason: {row.reason}
									</div>
								)}
								<div className="text-xs text-gray-500 dark:text-gray-500">
									Requested on {formattedDate}
								</div>
							</div>
						);
					}

					const detailText = buildAdminTaskDetails(row);

					return (
						<div className="space-y-1">
							<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
								{detailText}
							</div>
							{row.reason && (
								<div className="text-sm text-gray-600 dark:text-gray-400">
									Reason: {row.reason}
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
			{
				id: "actions",
				header: "Actions",
				accessor: () => "",
				cell: (row) => {
					const isApproving = approveMutation.isPending;
					const isRejecting = rejectMutation.isPending;
					const isBusy = isApproving || isRejecting;

					return (
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									handleApproveClick(row);
								}}
								disabled={isBusy}
								className="bg-green-600 hover:bg-green-700 text-white"
							>
								{isApproving ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<CheckCircle className="size-4 mr-1" />
								)}
								Approve
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={(e) => {
									e.stopPropagation();
									rejectMutation.mutate(row.id);
								}}
								disabled={isBusy}
								className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
							>
								{isRejecting ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<XCircle className="size-4 mr-1" />
								)}
								Reject
							</Button>
						</div>
					);
				},
				sortable: false,
				width: "220px",
			},
		],
		[approveMutation, rejectMutation]
	);

	const secondaryName = taskToApprove?.secondary_users?.[0]
		? `${taskToApprove.secondary_users[0].display_first_name} ${taskToApprove.secondary_users[0].display_last_name}`
		: "the secondary user";
	const primaryName = taskToApprove?.primary_user
		? `${taskToApprove.primary_user.display_first_name} ${taskToApprove.primary_user.display_last_name}`
		: "the primary user";

	return (
		<>
			<DataTable
				data={tasks}
				columns={columns}
				getRowKey={(row) => row.id}
				defaultSort={{ column: "requester", direction: "asc" }}
				emptyMessage="No pending merge requests."
				ariaLabel="Merge user requests"
			/>

			<AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirm Merge Approval</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className="space-y-3">
								<p>
									This will merge{" "}
									<span className="font-semibold">{secondaryName}</span> into{" "}
									<span className="font-semibold">{primaryName}</span>.
								</p>
								<ul className="list-disc pl-5 space-y-1 text-sm">
									<li>
										All projects, comments, and documents will be transferred
									</li>
									<li>The secondary user will be permanently deleted</li>
								</ul>
								<p className="text-sm font-medium text-red-600 dark:text-red-400">
									This action cannot be undone.
								</p>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmApprove}
							className="bg-green-600 hover:bg-green-700"
						>
							Confirm Approve
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
