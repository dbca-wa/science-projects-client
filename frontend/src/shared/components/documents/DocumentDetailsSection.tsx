import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { IMainDoc } from "@/shared/types/document.types";
import type { IProjectData } from "@/shared/types/project.types";
import { formatDetailedDateTime } from "@/shared/utils/date.utils";
import {
	getDocumentTypeIdLabel,
	getDocumentStatusLabel,
} from "@/shared/utils/document.utils";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import { UserLink } from "@/shared/components/user";
import { ProjectTag } from "@/shared/components/badges/ProjectTag";
import { ProjectStatusBadge } from "@/shared/components/projects/ProjectStatusBadge";
import { useUserDetail } from "@/shared/hooks/queries/useUserDetail";

interface DocumentDetailsSectionProps {
	document: IMainDoc;
	project: IProjectData;
	typeSpecificId?: number; // Optional: The ID of the specific document type (ConceptPlan.id, ProjectPlan.id, etc.)
}

interface DetailRowProps {
	label: string;
	children: React.ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
	return (
		<div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start">
			<span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
				{label}
			</span>
			<div className="text-sm min-w-0">{children}</div>
		</div>
	);
}

function DocumentStatusBadge({ status }: { status: string }) {
	const label = getDocumentStatusLabel(status);

	// Use appropriate colour based on status
	let colorClass = "bg-gray-600 text-white";
	if (status === "approved") {
		colorClass = "bg-green-600 text-white";
	} else if (status === "inapproval") {
		colorClass = "bg-blue-600 text-white";
	} else if (status === "inreview" || status === "revising") {
		colorClass = "bg-orange-600 text-white";
	} else if (status === "new") {
		colorClass = "bg-red-600 text-white";
	}

	return <Badge className={colorClass}>{label}</Badge>;
}

export function DocumentDetailsSection({
	document,
	project,
	typeSpecificId,
}: DocumentDetailsSectionProps) {
	const documentTypeIdLabel = getDocumentTypeIdLabel(document.kind);

	// Fetch creator and modifier user data
	const { data: creator } = useUserDetail(document.creator);
	const { data: modifier } = useUserDetail(document.modifier);

	const creatorName = creator ? getUserDisplayName(creator) : "Loading...";
	const modifierName = modifier ? getUserDisplayName(modifier) : "Loading...";

	return (
		<Card className="gap-0 bg-[#EBF0F6] dark:bg-gray-700">
			<CardHeader className="pb-4">
				<CardTitle>Details</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 pt-0">
				{/* Project Section */}
				<div className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-muted/30 dark:bg-gray-900 p-3 space-y-3">
					<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						Project
					</h3>
					<div className="space-y-3">
						<DetailRow label="Status">
							<ProjectStatusBadge status={project.status} className="text-sm" />
						</DetailRow>

						<DetailRow label="Project Tag">
							<ProjectTag project={project} className="text-sm py-1" />
						</DetailRow>

						<DetailRow label="Project ID">{project.id}</DetailRow>
					</div>
				</div>

				{/* Document Section */}
				<div className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-muted/30 dark:bg-gray-900 p-3 space-y-3">
					<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						Document
					</h3>
					<div className="space-y-3">
						<DetailRow label="Status">
							<DocumentStatusBadge status={document.status} />
						</DetailRow>

						<DetailRow label="Document ID">{document.id}</DetailRow>

						{typeSpecificId && (
							<DetailRow label={documentTypeIdLabel}>
								{typeSpecificId}
							</DetailRow>
						)}

						<DetailRow label="Created By">
							<div className="flex flex-col items-end gap-0.5">
								<UserLink userId={document.creator} displayName={creatorName} />
								<span className="text-xs text-muted-foreground">
									{formatDetailedDateTime(document.created_at)}
								</span>
							</div>
						</DetailRow>

						<DetailRow label="Modified By">
							<div className="flex flex-col items-end gap-0.5">
								<UserLink
									userId={document.modifier}
									displayName={modifierName}
								/>
								<span className="text-xs text-muted-foreground">
									{formatDetailedDateTime(document.updated_at)}
								</span>
							</div>
						</DetailRow>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
