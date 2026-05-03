import { useMemo } from "react";
import { Link } from "react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import { useUnapprovedDocs } from "../../hooks/useDataLists";
import type { IUnapprovedProject } from "../../types/admin.types";

/** Formats a project kind slug into a readable label */
const formatKind = (kind: string): string => {
	const kindMap: Record<string, string> = {
		core_function: "Core Function",
		science: "Science",
		student: "Student",
		external: "External",
	};
	return kindMap[kind] ?? kind;
};

/** Formats a project status slug into a readable label */
const formatStatus = (status: string): string => {
	const statusMap: Record<string, string> = {
		new: "New",
		pending: "Pending",
		active: "Active",
		updating: "Updating",
		suspended: "Suspended",
	};
	return statusMap[status] ?? status;
};

/** Displays unapproved documents for the current financial year */
export const UnapprovedDocsTab = () => {
	const { data: projects = [], isLoading, error } = useUnapprovedDocs();

	const columns = useMemo<ColumnDef<IUnapprovedProject>[]>(
		() => [
			{
				id: "title",
				header: "Project Title",
				accessor: (row) => row.title,
				sortable: true,
				sortFn: (a, b) => a.title.localeCompare(b.title),
				width: "2fr",
				cell: (row) => {
					const plainTitle = sanitizeInput(row.title);
					return (
						<Link
							to={`/projects/${row.id}/overview`}
							className="break-words font-medium text-blue-600 hover:underline dark:text-blue-400"
						>
							{plainTitle}
						</Link>
					);
				},
			},
			{
				id: "kind",
				header: "Kind",
				accessor: (row) => row.kind,
				sortable: true,
				width: "auto",
				cell: (row) => <Badge variant="outline">{formatKind(row.kind)}</Badge>,
			},
			{
				id: "status",
				header: "Status",
				accessor: (row) => row.status,
				sortable: true,
				width: "auto",
				cell: (row) => (
					<Badge variant="secondary">{formatStatus(row.status)}</Badge>
				),
			},
			{
				id: "businessArea",
				header: "Business Area",
				accessor: (row) => row.business_area?.name ?? "",
				sortable: true,
				width: "1fr",
				cell: (row) => (
					<span className="text-sm text-muted-foreground">
						{row.business_area?.name ?? "N/A"}
					</span>
				),
			},
		],
		[]
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">
					Loading unapproved documents...
				</span>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="my-4">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load unapproved documents. Please try refreshing the page.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="mt-4">
			<p className="mb-3 text-sm text-muted-foreground">
				{projects.length} unapproved project
				{projects.length !== 1 ? "s" : ""} this financial year
			</p>
			<DataTable
				data={projects}
				columns={columns}
				getRowKey={(row) => row.id}
				defaultSort={{ column: "title", direction: "asc" }}
				emptyMessage="No unapproved documents found for the current financial year."
				ariaLabel="Unapproved documents table"
			/>
		</div>
	);
};
