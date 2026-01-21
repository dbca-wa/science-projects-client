import { useState } from "react";
import { useNavigate } from "react-router";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
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

	const columns: ColumnDef<IAdminTask>[] = [
		{
			accessorKey: "primary_user",
			header: ({ column }) => {
				const isSorted = column.getIsSorted();
				let SortIcon = ArrowUpDown;

				if (isSorted === "asc") {
					SortIcon = ArrowDown;
				} else if (isSorted === "desc") {
					SortIcon = ArrowUp;
				}

				return (
					<button
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 font-semibold hover:text-green-600 dark:hover:text-green-400 transition-colors"
					>
						For (User)
						<SortIcon className="h-4 w-4" />
					</button>
				);
			},
			cell: ({ row }) => {
				const primaryUser = row.original.primary_user;
				if (!primaryUser) return <div className="text-gray-500">N/A</div>;

				return (
					<div>
						<div className="font-semibold text-green-600 dark:text-green-400">
							{primaryUser.display_first_name} {primaryUser.display_last_name}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							{primaryUser.email}
						</div>
					</div>
				);
			},
			sortingFn: (rowA, rowB) => {
				const a = rowA.original.primary_user
					? `${rowA.original.primary_user.display_first_name} ${rowA.original.primary_user.display_last_name}`
					: "";
				const b = rowB.original.primary_user
					? `${rowB.original.primary_user.display_first_name} ${rowB.original.primary_user.display_last_name}`
					: "";
				return a.localeCompare(b);
			},
		},
		{
			accessorKey: "secondary_users",
			header: ({ column }) => {
				const isSorted = column.getIsSorted();
				let SortIcon = ArrowUpDown;

				if (isSorted === "asc") {
					SortIcon = ArrowDown;
				} else if (isSorted === "desc") {
					SortIcon = ArrowUp;
				}

				return (
					<button
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						className="flex items-center gap-2 font-semibold hover:text-green-600 dark:hover:text-green-400 transition-colors"
					>
						Proposed Caretaker
						<SortIcon className="h-4 w-4" />
					</button>
				);
			},
			cell: ({ row }) => {
				const caretaker = row.original.secondary_users?.[0];
				if (!caretaker) return <div className="text-gray-500">N/A</div>;

				return (
					<div>
						<div className="font-semibold text-blue-600 dark:text-blue-400">
							{caretaker.display_first_name} {caretaker.display_last_name}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							{caretaker.email}
						</div>
					</div>
				);
			},
			sortingFn: (rowA, rowB) => {
				const a = rowA.original.secondary_users?.[0]
					? `${rowA.original.secondary_users[0].display_first_name} ${rowA.original.secondary_users[0].display_last_name}`
					: "";
				const b = rowB.original.secondary_users?.[0]
					? `${rowB.original.secondary_users[0].display_first_name} ${rowB.original.secondary_users[0].display_last_name}`
					: "";
				return a.localeCompare(b);
			},
		},
		{
			accessorKey: "reason",
			header: () => {
				return <div className="font-semibold">Details</div>;
			},
			cell: ({ row }) => {
				const task = row.original;
				const formattedDate = format(new Date(task.created_at), "MMM d, yyyy 'at' h:mm a");
				const requester = task.requester;

				return (
					<div className="space-y-1">
						{task.reason && (
							<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
								{formatCaretakerReason(task.reason)}
							</div>
						)}
						{task.notes && (
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Note: {task.notes}
							</div>
						)}
						<div className="text-xs text-gray-500 dark:text-gray-500">
							Requested by {requester.display_first_name} {requester.display_last_name} on {formattedDate}
						</div>
					</div>
				);
			},
		},
	];

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "primary_user",
			desc: false,
		},
	]);

	const table = useReactTable({
		data: tasks,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
	});

	return (
		<div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className="bg-green-50 dark:bg-green-900/20">
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								onClick={(e) => handleRowClick(e)}
								className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10"
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								<div className="text-gray-500 dark:text-gray-400">
									No pending caretaker requests.
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
