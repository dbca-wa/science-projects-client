import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Loader2, AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { DataTable, type ColumnDef } from "@/shared/components/DataTable";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import {
	useProblematicProjects,
	useRemedyOpenClosed,
	useRemedyMemberless,
	useRemedyLeaderless,
	useRemedyMultipleLeaders,
	useRemedyExternalLeaders,
	useRemedyRoleMismatch,
	useRemedyClosureStateMismatch,
	useRemedyClosureNotClosing,
	useRemedyLegacySuspendedClosure,
} from "../../hooks/useDataLists";
import type {
	IProblematicProject,
	IProblematicProjectsData,
} from "../../types/admin.types";

type RemedyKey = keyof IProblematicProjectsData;
type ActionType = "remedy" | "download" | "none";

interface CategoryConfig {
	key: RemedyKey;
	label: string;
	actionType: ActionType;
	remedyDescription?: string;
}

/** All 8 categories — ordered to match the original app plus new additions */
const CATEGORIES: CategoryConfig[] = [
	{
		key: "no_progress",
		label:
			"Projects with Progress Reports with No Updates Since Creation This FY",
		actionType: "none",
	},
	{
		key: "inactive_lead_active_project",
		label: "Active Projects with Inactive Staff Leaders",
		actionType: "download",
	},
	{
		key: "open_with_closure",
		label: "Projects with Approved Closure That Are Open",
		actionType: "remedy",
		remedyDescription:
			"Each project will be set to its closure's intended outcome (completed or terminated). The closure document is kept.",
	},
	{
		key: "no_business_area",
		label: "Active Projects with No Business Area",
		actionType: "none",
	},
	{
		key: "memberless",
		label: "Projects with No Members",
		actionType: "remedy",
		remedyDescription:
			"The function will check the creator of the first document (if one exists) and add them to the project as the leader. If no document exists, the project will be skipped.",
	},
	{
		key: "leaderless",
		label: "Projects with Members but No Leader Role",
		actionType: "remedy",
		remedyDescription:
			"The function will find the member with the is_leader property set to true and assign them the Project Lead (Supervising) role.",
	},
	{
		key: "multiple_leaders",
		label: "Projects with Multiple Project Leader Roles",
		actionType: "remedy",
		remedyDescription:
			"The function will keep one leader and reassign others to appropriate roles based on the project type and whether they are staff.",
	},
	{
		key: "external_leaders",
		label: "Projects with Leaders Set to External User",
		actionType: "remedy",
		remedyDescription:
			"The function will find the DBCA staff member who created the first document and assign them leader status. If no suitable staff member is found, the project will be skipped.",
	},
	{
		key: "role_mismatch",
		label: "Projects with Role/Leader Mismatch",
		actionType: "remedy",
		remedyDescription:
			"Fixes mismatches between the is_leader flag and the supervising role. Leaders without the supervising role will get it assigned. Members with the supervising role but without is_leader will be demoted (if another leader exists) or promoted to leader.",
	},
	{
		key: "closure_state_mismatch",
		label: "Projects with Closure Document in Wrong State",
		actionType: "remedy",
		remedyDescription:
			"Each affected project will be set to 'closure_requested' status to align with its closure document.",
	},
	{
		key: "closure_not_closing",
		label: "Projects with Any Closure Not in Closing State",
		actionType: "remedy",
		remedyDescription:
			"Projects with a fully-approved closure will be set to their intended outcome (completed or terminated). Projects with an unapproved closure will be set to 'closure_requested'.",
	},
	{
		key: "legacy_suspended_closure",
		label: "Suspended Projects with Closure (Legacy)",
		actionType: "remedy",
		remedyDescription:
			"The closure document will be removed from each project. The project will remain in 'suspended' status.",
	},
];

/** Column definitions shared across all category tables */
const useCategoryColumns = () =>
	useMemo<ColumnDef<IProblematicProject>[]>(
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
				id: "status",
				header: "Status",
				accessor: (row) => row.status,
				sortable: true,
				width: "auto",
				cell: (row) => <span className="text-sm capitalize">{row.status}</span>,
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

/** Downloads project data as a plain text file */
const downloadProjectsAsTxt = (projects: IProblematicProject[]) => {
	const lines = projects.map((p) => {
		const title = sanitizeInput(p.title);
		const ba = p.business_area?.name ?? "No BA";
		return `${title} | ${ba} | ${p.status}`;
	});
	const content = lines.join("\n");
	const blob = new Blob([content], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "problematic_projects.txt";
	link.click();
	URL.revokeObjectURL(url);
};

/** Remedy confirmation dialog for open/closed projects */
const RemedyOpenClosedDialog = ({
	open,
	onOpenChange,
	projects,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projects: IProblematicProject[];
}) => {
	const mutation = useRemedyOpenClosed();

	const handleRemedy = () => {
		mutation.mutate(
			{ projects: projects.map((p) => p.id) },
			{ onSuccess: () => onOpenChange(false) }
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Remedy Open/Closed Projects</DialogTitle>
					<DialogDescription>
						This will affect {projects.length} project(s) with approved closures
						that are still open.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-2">
					<p className="text-sm text-muted-foreground">
						Each project will be set to its closure&apos;s intended outcome
						(completed or terminated). The closure documents will be kept.
					</p>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleRemedy} disabled={mutation.isPending}>
						{mutation.isPending && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Remedy
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

/** Generic remedy confirmation dialog for simple remedy actions */
const RemedyConfirmDialog = ({
	open,
	onOpenChange,
	title,
	description,
	projectCount,
	onConfirm,
	isPending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	projectCount: number;
	onConfirm: () => void;
	isPending: boolean;
}) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>
					This will affect {projectCount} project(s).
				</DialogDescription>
			</DialogHeader>
			<p className="text-sm text-muted-foreground py-2">{description}</p>
			<div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
				<p className="text-sm text-amber-800 dark:text-amber-300">
					<strong>⚠ Note:</strong> This automated remedy may not catch all edge
					cases. Manual review of each affected project is recommended to ensure
					the correct state is applied.
				</p>
			</div>
			<DialogFooter>
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					Cancel
				</Button>
				<Button onClick={onConfirm} disabled={isPending}>
					{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
					Approve & Remedy
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

import { CollapsibleCard } from "@/shared/components/CollapsibleCard";

/** Collapsible category section using shared CollapsibleCard with action buttons */
const CategorySection = ({
	category,
	projects,
	columns,
	onRemedy,
	onDownload,
}: {
	category: CategoryConfig;
	projects: IProblematicProject[];
	columns: ColumnDef<IProblematicProject>[];
	onRemedy?: () => void;
	onDownload?: () => void;
}) => {
	const actionButtons = (
		<>
			{category.actionType === "remedy" && projects.length > 0 && onRemedy && (
				<Button variant="default" size="sm" onClick={onRemedy}>
					Remedy
				</Button>
			)}
			{category.actionType === "download" &&
				projects.length > 0 &&
				onDownload && (
					<Button variant="outline" size="sm" onClick={onDownload}>
						<Download className="mr-1.5 size-3.5" />
						Download TXT List
					</Button>
				)}
		</>
	);

	return (
		<CollapsibleCard
			title={category.label}
			count={projects.length}
			actions={actionButtons}
		>
			{projects.length === 0 ? (
				<p className="py-4 text-center text-sm text-muted-foreground">
					No projects in this category
				</p>
			) : (
				<DataTable
					data={projects}
					columns={columns}
					getRowKey={(row) => row.id}
					defaultSort={{ column: "title", direction: "asc" }}
					emptyMessage="No projects in this category."
					ariaLabel={`${category.label} table`}
				/>
			)}
		</CollapsibleCard>
	);
};

/** Displays problematic projects grouped by issue category with remedy actions */
export const ProblematicProjectsTab = () => {
	const { data, isLoading, error } = useProblematicProjects();
	const columns = useCategoryColumns();

	const [remedyDialog, setRemedyDialog] = useState<RemedyKey | null>(null);

	const memberlessMutation = useRemedyMemberless();
	const leaderlessMutation = useRemedyLeaderless();
	const multipleLeadersMutation = useRemedyMultipleLeaders();
	const externalLeadersMutation = useRemedyExternalLeaders();
	const roleMismatchMutation = useRemedyRoleMismatch();
	const closureStateMismatchMutation = useRemedyClosureStateMismatch();
	const closureNotClosingMutation = useRemedyClosureNotClosing();
	const legacySuspendedClosureMutation = useRemedyLegacySuspendedClosure();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">
					Loading problematic projects...
				</span>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="my-4">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load problematic projects. Please try refreshing the page.
				</AlertDescription>
			</Alert>
		);
	}

	if (!data) {
		return (
			<p className="py-8 text-center text-muted-foreground">
				No problematic project data available.
			</p>
		);
	}

	const getProjects = (key: RemedyKey): IProblematicProject[] =>
		data[key] ?? [];

	/** Total count of all problematic projects across all categories */
	const totalCount = CATEGORIES.reduce(
		(sum, c) => sum + getProjects(c.key).length,
		0
	);

	const handleRemedyConfirm = (key: RemedyKey) => {
		const projects = getProjects(key);
		const pks = projects.map((p) => p.id);

		const mutationMap: Partial<
			Record<
				RemedyKey,
				{
					mutate: (
						data: { projects: number[] },
						options?: { onSuccess?: () => void }
					) => void;
				}
			>
		> = {
			memberless: memberlessMutation,
			leaderless: leaderlessMutation,
			multiple_leaders: multipleLeadersMutation,
			external_leaders: externalLeadersMutation,
			role_mismatch: roleMismatchMutation,
			closure_state_mismatch:
				closureStateMismatchMutation as unknown as typeof memberlessMutation,
			closure_not_closing:
				closureNotClosingMutation as unknown as typeof memberlessMutation,
			legacy_suspended_closure:
				legacySuspendedClosureMutation as unknown as typeof memberlessMutation,
		};

		const mutation = mutationMap[key];
		if (mutation) {
			mutation.mutate(
				{ projects: pks },
				{ onSuccess: () => setRemedyDialog(null) }
			);
		}
	};

	const getPendingState = (key: RemedyKey): boolean => {
		const pendingMap: Partial<Record<RemedyKey, boolean>> = {
			memberless: memberlessMutation.isPending,
			leaderless: leaderlessMutation.isPending,
			multiple_leaders: multipleLeadersMutation.isPending,
			external_leaders: externalLeadersMutation.isPending,
			role_mismatch: roleMismatchMutation.isPending,
			closure_state_mismatch: closureStateMismatchMutation.isPending,
			closure_not_closing: closureNotClosingMutation.isPending,
			legacy_suspended_closure: legacySuspendedClosureMutation.isPending,
		};
		return pendingMap[key] ?? false;
	};

	return (
		<div className="mt-4 space-y-4">
			<p className="text-sm text-muted-foreground">
				{totalCount} issue{totalCount !== 1 ? "s" : ""} across{" "}
				{CATEGORIES.length} categories
			</p>

			{CATEGORIES.map((category) => {
				const projects = getProjects(category.key);
				return (
					<CategorySection
						key={category.key}
						category={category}
						projects={projects}
						columns={columns}
						onRemedy={
							category.actionType === "remedy"
								? () => setRemedyDialog(category.key)
								: undefined
						}
						onDownload={
							category.actionType === "download"
								? () => downloadProjectsAsTxt(projects)
								: undefined
						}
					/>
				);
			})}

			{/* Open/Closed remedy dialog (special — has status selector) */}
			<RemedyOpenClosedDialog
				open={remedyDialog === "open_with_closure"}
				onOpenChange={(open) => !open && setRemedyDialog(null)}
				projects={getProjects("open_with_closure")}
			/>

			{/* Generic remedy dialogs for other categories */}
			{CATEGORIES.filter(
				(c) => c.actionType === "remedy" && c.key !== "open_with_closure"
			).map((category) => (
				<RemedyConfirmDialog
					key={category.key}
					open={remedyDialog === category.key}
					onOpenChange={(open) => !open && setRemedyDialog(null)}
					title={`Remedy: ${category.label}`}
					description={category.remedyDescription ?? ""}
					projectCount={getProjects(category.key).length}
					onConfirm={() => handleRemedyConfirm(category.key)}
					isPending={getPendingState(category.key)}
				/>
			))}
		</div>
	);
};
