import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import type { IProjectData } from "@/shared/types/project.types";
import type { IUserMe } from "@/shared/types/user.types";

interface DeletionRequestBannerProps {
	project: IProjectData;
	currentUser: IUserMe | null;
	userIsCaretakerOfAdmin: boolean;
	isBaLead?: boolean;
	userIsCaretakerOfBaLeader?: boolean;
	onDeleteProject: () => void;
	onCancelRequest: () => void;
}

/**
 * Prominent banner displayed when a project has a pending deletion request.
 *
 * Admin users (superusers or caretakers of admin) see action buttons to
 * delete the project or cancel the request. Non-admin users see a
 * read-only indicator.
 */
export function DeletionRequestBanner({
	project,
	currentUser,
	userIsCaretakerOfAdmin,
	isBaLead,
	userIsCaretakerOfBaLeader,
	onDeleteProject,
	onCancelRequest,
}: DeletionRequestBannerProps) {
	if (!project.deletion_requested) {
		return null;
	}

	const canApprove =
		currentUser?.is_superuser ||
		userIsCaretakerOfAdmin ||
		isBaLead ||
		userIsCaretakerOfBaLeader;

	return (
		<Alert
			variant="destructive"
			className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
		>
			<AlertTriangle className="h-4 w-4" />
			<AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<span className="font-semibold text-red-700 dark:text-red-300">
					Deletion Requested
				</span>

				{canApprove && (
					<div className="flex gap-2">
						<Button variant="destructive" size="sm" onClick={onDeleteProject}>
							Delete Project
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onCancelRequest}
							className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
						>
							Cancel Request
						</Button>
					</div>
				)}
			</AlertDescription>
		</Alert>
	);
}
