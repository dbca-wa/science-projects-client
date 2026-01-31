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
import { MdDelete } from "react-icons/md";
import { BsFillSignMergeLeftFill } from "react-icons/bs";
import { FaUserCog } from "react-icons/fa";
import type { IAdminTask } from "../types/admin-tasks.types";
import { buildAdminTaskDetails, extractTextFromHTML } from "../utils/dashboard.utils";

interface AdminTasksDataTableProps {
	tasks: IAdminTask[];
}

type TaskAction = "deleteproject" | "mergeuser" | "setcaretaker";

const taskActionConfig = {
	deleteproject: {
		title: "Delete Project",
		description: "A user wishes to delete a project",
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-50 dark:bg-red-900/20",
		icon: MdDelete,
	},
	mergeuser: {
		title: "Merge User",
		description: "Merge two user accounts",
		color: "text-orange-600 dark:text-orange-400",
		bgColor: "bg-orange-50 dark:bg-orange-900/20",
		icon: BsFillSignMergeLeftFill,
	},
	setcaretaker: {
		title: "Set Caretaker",
		description: "Assign a caretaker for a user",
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-50 dark:bg-green-900/20",
		icon: FaUserCog,
	},
};

const taskActionOrder: TaskAction[] = ["setcaretaker", "deleteproject", "mergeuser"];

export const AdminTasksDataTable = ({ tasks }: AdminTasksDataTableProps) => {
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
			accessorKey: "requester",
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
						className="flex items-center gap-2 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
					>
						Requester
						<SortIcon className="h-4 w-4" />
					</button>
				);
			},
			cell: ({ row }) => {
				const requester = row.original.requester;
				return (
					<div>
						<div className="font-semibold text-blue-600 dark:text-blue-400">
							{requester.display_first_name} {requester.display_last_name}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">
							{requester.email}
						</div>
					</div>
				);
			},
			sortingFn: (rowA, rowB) => {
				const a = `${rowA.original.requester.display_first_name} ${rowA.original.requester.display_last_name}`;
				const b = `${rowB.original.requester.display_first_name} ${rowB.original.requester.display_last_name}`;
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
				
				// Use utility function to build detailed description
				const detailText = buildAdminTaskDetails(task);

				return (
					<div className="space-y-1">
						<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
							{detailText}
						</div>
						{task.notes && (
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Note: {task.notes}
							</div>
						)}
						{task.action === "deleteproject" && task.project && (
							<div className="text-xs text-red-600 dark:text-red-400 font-semibold">
								Project: {extractTextFromHTML(task.project.title)} (ID: {task.project.id})
							</div>
						)}
						<div className="text-xs text-gray-500 dark:text-gray-500">
							Requested on {formattedDate}
						</div>
					</div>
				);
			},
		},
	];

	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "requester",
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
						<TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-800">
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
								className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
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
									All done! No pending tasks.
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};
