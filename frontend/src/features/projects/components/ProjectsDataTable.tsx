import { useMemo, useState } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { IProjectData, ProjectRoles } from "@/shared/types/project.types";
import { ProjectKindBadge } from "./ProjectKindBadge";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { getImageUrl } from "@/shared/utils/image.utils";
import { sanitizeInput } from "@/shared/utils/sanitize.utils";
import { PROJECT_ROLE_CONFIG } from "@/shared/constants/project.constants";
import { cn } from "@/shared/lib/utils";

/**
 * Column configuration for ProjectsDataTable
 */
export interface ProjectsDataTableColumns {
	title: boolean;
	image: boolean;
	kind: boolean;
	status: boolean;
	businessArea: boolean;
	role: boolean;
	createdAt: boolean;
}

/**
 * Props for ProjectsDataTable component
 */
interface ProjectsDataTableProps {
	projects: IProjectData[];
	columns: ProjectsDataTableColumns;
	defaultSort: "title" | "kind" | "status" | "businessArea" | "role" | "createdAt";
	emptyMessage: string;
	onProjectClick: (projectId: number, event: React.MouseEvent) => void;
}

/**
 * Role Text Component
 * Displays project role with color coding (text only, not badge)
 */
function RoleText({ role }: { role: ProjectRoles }) {
	const config = PROJECT_ROLE_CONFIG[role];
	
	return (
		<span
			className="text-sm font-medium"
			style={{ color: config.color }}
		>
			{config.label}
		</span>
	);
}

/**
 * Project Image Component
 * Displays project image with loading and error states
 */
function ProjectImage({ project }: { project: IProjectData }) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [imageError, setImageError] = useState(false);
	const imageUrl = getImageUrl(project.image);
	const hasImage = !!imageUrl;
	const plainTextTitle = sanitizeInput(project.title);

	return (
		<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
			{!imageLoaded && !imageError && (
				<div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-800" />
			)}
			{hasImage && !imageError ? (
				<img
					src={imageUrl}
					alt={plainTextTitle}
					className={cn(
						"h-full w-full object-cover transition-opacity duration-300",
						imageLoaded ? "opacity-100" : "opacity-0"
					)}
					onLoad={() => setImageLoaded(true)}
					onError={() => {
						setImageError(true);
						setImageLoaded(true);
					}}
					loading="lazy"
				/>
			) : (
				<div className="project-fallback-image h-full w-full bg-cover bg-center bg-no-repeat" />
			)}
		</div>
	);
}

/**
 * ProjectsDataTable Component
 * 
 * Reusable table component for displaying projects with configurable columns and sorting.
 * Uses TanStack Table for sorting logic.
 * 
 * Features:
 * - Sortable columns (click header to sort)
 * - Configurable column visibility
 * - Responsive design
 * - Click/Ctrl+Click navigation support
 * - Custom empty state message
 */
export function ProjectsDataTable({
	projects,
	columns: columnConfig,
	defaultSort,
	emptyMessage,
	onProjectClick,
}: ProjectsDataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: defaultSort, desc: false },
	]);

	// Define columns based on configuration
	const columns = useMemo<ColumnDef<IProjectData>[]>(() => {
		const cols: ColumnDef<IProjectData>[] = [];

		// Title column (always included)
		cols.push({
			id: "title",
			accessorKey: "title",
			header: "Title",
			sortingFn: (rowA, rowB) => {
				// Simple alphabetical sort for title
				return rowA.original.title.localeCompare(rowB.original.title);
			},
			cell: ({ row }) => {
				const project = row.original;
				const plainTextTitle = sanitizeInput(project.title);

				return (
					<div className="flex items-center gap-3">
						{columnConfig.image && <ProjectImage project={project} />}
						<div className="flex flex-col gap-1">
							<span className="font-bold text-blue-400 dark:text-blue-200 hover:text-blue-300 dark:hover:text-blue-100 hover:underline cursor-pointer">
								{plainTextTitle}
							</span>
							<div className="flex flex-col gap-0.5">
								{project.tag && (
									<span className="text-xs font-semibold text-gray-400">
										{project.tag}
									</span>
								)}
								{!columnConfig.createdAt && project.created_at && (
									<span className="text-xs font-semibold text-gray-400">
										Created on {new Date(project.created_at).toLocaleDateString("en-AU", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								)}
							</div>
						</div>
					</div>
				);
			},
		});

		// Kind column
		if (columnConfig.kind) {
			cols.push({
				id: "kind",
				accessorKey: "kind",
				header: "Kind",
				cell: ({ row }) => <ProjectKindBadge kind={row.original.kind} />,
			});
		}

		// Status column (separate column)
		if (columnConfig.status) {
			cols.push({
				id: "status",
				accessorKey: "status",
				header: "Status",
				sortingFn: (rowA, rowB) => {
					// Sort by status first, then by title
					const statusCompare = rowA.original.status.localeCompare(rowB.original.status);
					if (statusCompare !== 0) return statusCompare;
					return rowA.original.title.localeCompare(rowB.original.title);
				},
				cell: ({ row }) => <ProjectStatusBadge status={row.original.status} />,
			});
		}

		// Business Area column
		if (columnConfig.businessArea) {
			cols.push({
				id: "businessArea",
				accessorFn: (row) => row.business_area?.name || "",
				header: "Business Area",
				cell: ({ row }) => (
					<span className="text-sm">{row.original.business_area?.name || "—"}</span>
				),
			});
		}

		// Role column
		if (columnConfig.role) {
			cols.push({
				id: "role",
				accessorKey: "role",
				header: "Role",
				sortingFn: (rowA, rowB) => {
					// Sort by role first, then by title
					const roleA = rowA.original.role || "";
					const roleB = rowB.original.role || "";
					const roleCompare = roleA.localeCompare(roleB);
					if (roleCompare !== 0) return roleCompare;
					return rowA.original.title.localeCompare(rowB.original.title);
				},
				cell: ({ row }) => {
					const role = row.original.role;
					return role ? <RoleText role={role} /> : <span className="text-sm text-muted-foreground">—</span>;
				},
			});
		}

		// Created At column
		if (columnConfig.createdAt) {
			cols.push({
				id: "createdAt",
				accessorKey: "created_at",
				header: "Created",
				cell: ({ row }) => {
					const date = row.original.created_at;
					if (!date) return <span className="text-sm text-muted-foreground">—</span>;
					
					const formatted = new Date(date).toLocaleDateString("en-AU", {
						year: "numeric",
						month: "short",
						day: "numeric",
					});
					
					return <span className="text-sm">{formatted}</span>;
				},
			});
		}

		return cols;
	}, [columnConfig]);

	const table = useReactTable({
		data: projects,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	// Handle row click
	const handleRowClick = (project: IProjectData, event: React.MouseEvent) => {
		onProjectClick(project.id, event);
	};

	// Empty state
	if (projects.length === 0) {
		return (
			<div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
				<p className="text-sm text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="w-full overflow-auto rounded-lg border">
			<table className="w-full">
				<thead className="bg-muted/50">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th
									key={header.id}
									className="px-4 py-3 text-left text-sm font-medium"
								>
									{header.isPlaceholder ? null : (
										<button
											type="button"
											className={cn(
												"flex items-center gap-2 hover:text-foreground",
												header.column.getCanSort() && "cursor-pointer select-none"
											)}
											onClick={header.column.getToggleSortingHandler()}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
											{header.column.getIsSorted() === "asc" && (
												<ChevronUp className="h-4 w-4" />
											)}
											{header.column.getIsSorted() === "desc" && (
												<ChevronDown className="h-4 w-4" />
											)}
										</button>
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className="cursor-pointer border-t transition-colors hover:bg-muted/50"
							onClick={(e) => handleRowClick(row.original, e)}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-4 py-3">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
