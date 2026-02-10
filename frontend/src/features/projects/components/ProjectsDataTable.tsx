import { useState, useMemo } from "react";
import type { IProjectData, ProjectRoles } from "@/shared/types/project.types";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { ProjectKindBadge } from "./ProjectKindBadge";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { getImageUrl } from "@/shared/utils/image.utils";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
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
 * Uses generic DataTable component.
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
	// Build columns based on configuration
	const columns = useMemo<ColumnDef<IProjectData>[]>(() => {
		const cols: ColumnDef<IProjectData>[] = [];

		// Title column (always included)
		cols.push({
			id: "title",
			header: "Title",
			accessor: (row) => row.title,
			sortable: true,
			sortFn: (a, b) => a.title.localeCompare(b.title),
			width: "2fr",
			cell: (row) => {
				const plainTextTitle = sanitizeInput(row.title);
				return (
					<div className="flex items-center gap-3">
						{columnConfig.image && <ProjectImage project={row} />}
						<div className="flex flex-col gap-1">
							<span className="font-bold text-blue-400 dark:text-blue-200 hover:text-blue-300 dark:hover:text-blue-100 hover:underline cursor-pointer">
								{plainTextTitle}
							</span>
							<div className="flex flex-col gap-0.5">
								{row.tag && (
									<span className="text-xs font-semibold text-gray-400">
										{row.tag}
									</span>
								)}
								{!columnConfig.createdAt && row.created_at && (
									<span className="text-xs font-semibold text-gray-400">
										Created on {new Date(row.created_at).toLocaleDateString("en-AU", {
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
				header: "Kind",
				accessor: (row) => row.kind,
				sortable: true,
				width: "auto",
				cell: (row) => <ProjectKindBadge kind={row.kind} />,
			});
		}

		// Status column
		if (columnConfig.status) {
			cols.push({
				id: "status",
				header: "Status",
				accessor: (row) => row.status,
				sortable: true,
				sortFn: (a, b) => {
					const statusCompare = a.status.localeCompare(b.status);
					if (statusCompare !== 0) return statusCompare;
					return a.title.localeCompare(b.title);
				},
				width: "auto",
				cell: (row) => <ProjectStatusBadge status={row.status} />,
			});
		}

		// Business Area column
		if (columnConfig.businessArea) {
			cols.push({
				id: "businessArea",
				header: "Business Area",
				accessor: (row) => row.business_area?.name || "",
				sortable: true,
				width: "1fr",
				cell: (row) => (
					<span className="text-sm">{row.business_area?.name || "—"}</span>
				),
			});
		}

		// Role column
		if (columnConfig.role) {
			cols.push({
				id: "role",
				header: "Role",
				accessor: (row) => row.role || "",
				sortable: true,
				sortFn: (a, b) => {
					const roleA = a.role || "";
					const roleB = b.role || "";
					const roleCompare = roleA.localeCompare(roleB);
					if (roleCompare !== 0) return roleCompare;
					return a.title.localeCompare(b.title);
				},
				width: "auto",
				cell: (row) => {
					const role = row.role;
					return role ? <RoleText role={role} /> : <span className="text-sm text-muted-foreground">—</span>;
				},
			});
		}

		// Created At column
		if (columnConfig.createdAt) {
			cols.push({
				id: "createdAt",
				header: "Created",
				accessor: (row) => row.created_at || "",
				sortable: true,
				width: "auto",
				cell: (row) => {
					const date = row.created_at;
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

	// Handle row click - extract project ID
	const handleRowClick = (project: IProjectData, event: React.MouseEvent) => {
		onProjectClick(project.id, event);
	};

	return (
		<DataTable
			data={projects}
			columns={columns}
			getRowKey={(project) => project.id}
			onRowClick={handleRowClick}
			defaultSort={{ column: defaultSort, direction: "asc" }}
			emptyMessage={emptyMessage}
			ariaLabel="Projects table"
		/>
	);
}
