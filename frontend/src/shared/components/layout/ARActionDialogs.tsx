import { useState, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	useOpenNewCycle,
	useBatchApprove,
	useBatchApproveOld,
} from "@/features/admin/hooks/useAdminActions";
import { useNewCyclePreview } from "@/shared/hooks/queries/useBumpEmails";
import { RecipientPreviewPanel } from "./RecipientPreviewPanel";
import type { ARActionId } from "./ManageDropdownContent";

interface ARActionDialogsProps {
	activeAction: ARActionId | null;
	onClose: () => void;
	divisionSlug?: string;
}

/**
 * Reusable AR Action confirmation dialogs.
 * Used by both the Header (manage dropdown) and MyDivisionView.
 */
export const ARActionDialogs = ({
	activeAction,
	onClose,
	divisionSlug,
}: ARActionDialogsProps) => {
	// Batch approve states — unchecked by default
	const [baSendNotifications, setBaSendNotifications] = useState(false);
	const [baOldSendNotifications, setBaOldSendNotifications] = useState(false);

	// New cycle states — all unchecked by default
	const [includeUpdating, setIncludeUpdating] = useState(false);
	const [prepopulate, setPrepopulate] = useState(false);

	// Recipient group selection — all unchecked by default
	const [sendBaLeads, setSendBaLeads] = useState(false);
	const [sendProjectLeads, setSendProjectLeads] = useState(false);
	const [sendTeamMembers, setSendTeamMembers] = useState(false);

	// Excluded user IDs for the new cycle email
	const [excludedUserIds, setExcludedUserIds] = useState<number[]>([]);

	const batchApproveMutation = useBatchApprove();
	const batchApproveOldMutation = useBatchApproveOld();
	const newCycleMutation = useOpenNewCycle();

	const anySendGroup = sendBaLeads || sendProjectLeads || sendTeamMembers;
	const isEmailOnly = anySendGroup && !includeUpdating && !prepopulate;
	const hasAnySelection = includeUpdating || prepopulate || anySendGroup;

	// Build recipient_groups array from checkboxes
	const selectedGroups = [
		...(sendBaLeads ? ["ba_leads"] : []),
		...(sendProjectLeads ? ["project_leads"] : []),
		...(sendTeamMembers ? ["team_members"] : []),
	];

	const { data: recipientPreview } = useNewCyclePreview(
		anySendGroup && activeAction === "new-cycle",
		divisionSlug
	);

	// Filter preview data to only show selected groups
	const filteredBaLeads =
		sendBaLeads && recipientPreview ? recipientPreview.recipients.ba_leads : [];
	const filteredProjectLeads =
		sendProjectLeads && recipientPreview
			? recipientPreview.recipients.project_leads
			: [];
	const filteredTeamMembers =
		sendTeamMembers && recipientPreview
			? recipientPreview.recipients.team_members
			: [];

	const handleExcludeUser = useCallback((userId: number) => {
		setExcludedUserIds((prev) =>
			prev.includes(userId) ? prev : [...prev, userId]
		);
	}, []);

	const handleRestoreUser = useCallback((userId: number) => {
		setExcludedUserIds((prev) => prev.filter((id) => id !== userId));
	}, []);

	return (
		<>
			{/* Batch Approve Dialog */}
			<Dialog
				open={activeAction === "batch-approve"}
				onOpenChange={(open) => !open && onClose()}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Batch Approve Reports</DialogTitle>
						<DialogDescription>
							This will approve all outstanding current-year reports at stage 3
							(awaiting final approval).
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center gap-2 py-2">
						<Checkbox
							id="ar-ba-send-notifications"
							checked={baSendNotifications}
							onCheckedChange={(checked) =>
								setBaSendNotifications(checked === true)
							}
						/>
						<Label
							htmlFor="ar-ba-send-notifications"
							className="text-sm text-muted-foreground cursor-pointer"
						>
							Send approval notification emails
						</Label>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							className="bg-green-600 hover:bg-green-700 text-white"
							disabled={batchApproveMutation.isPending}
							onClick={() => {
								batchApproveMutation.mutate(
									{
										division: divisionSlug,
										send_notifications: baSendNotifications,
									},
									{ onSuccess: onClose }
								);
							}}
						>
							{batchApproveMutation.isPending ? "Approving..." : "Approve All"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Batch Approve Old Dialog */}
			<Dialog
				open={activeAction === "batch-approve-old"}
				onOpenChange={(open) => !open && onClose()}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Batch Approve Older Reports</DialogTitle>
						<DialogDescription>
							This will approve all outstanding reports from previous years.
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center gap-2 py-2">
						<Checkbox
							id="ar-ba-old-send-notifications"
							checked={baOldSendNotifications}
							onCheckedChange={(checked) =>
								setBaOldSendNotifications(checked === true)
							}
						/>
						<Label
							htmlFor="ar-ba-old-send-notifications"
							className="text-sm text-muted-foreground cursor-pointer"
						>
							Send approval notification emails
						</Label>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							className="bg-blue-600 hover:bg-blue-700 text-white"
							disabled={batchApproveOldMutation.isPending}
							onClick={() => {
								batchApproveOldMutation.mutate(
									{
										division: divisionSlug,
										send_notifications: baOldSendNotifications,
									},
									{ onSuccess: onClose }
								);
							}}
						>
							{batchApproveOldMutation.isPending
								? "Approving..."
								: "Approve All Old"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Open New Cycle Dialog */}
			<Dialog
				open={activeAction === "new-cycle"}
				onOpenChange={(open) => !open && onClose()}
			>
				<DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Open New Reporting Cycle</DialogTitle>
						<DialogDescription>
							Create new progress and student reports for the current year.
						</DialogDescription>
					</DialogHeader>

					<p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-3 py-2">
						Ensure an Annual Report has been created for the target year before
						opening a new cycle. If the cycle has already been opened, you can
						re-run this to send announcement emails only.
					</p>

					<div className="space-y-3 py-2">
						<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
							Report Creation
						</p>
						<div className="flex items-start gap-2">
							<Checkbox
								id="ar-include-updating"
								checked={includeUpdating}
								onCheckedChange={(checked) =>
									setIncludeUpdating(checked === true)
								}
							/>
							<div>
								<Label
									htmlFor="ar-include-updating"
									className="text-sm cursor-pointer"
								>
									Include projects with &quot;Updating&quot; and
									&quot;Suspended&quot; status
								</Label>
								<p className="text-xs text-muted-foreground mt-0.5">
									When unchecked, only active projects will receive new reports.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-2">
							<Checkbox
								id="ar-prepopulate"
								checked={prepopulate}
								onCheckedChange={(checked) => setPrepopulate(checked === true)}
							/>
							<div>
								<Label
									htmlFor="ar-prepopulate"
									className="text-sm cursor-pointer"
								>
									Prepopulate all fields from prior year
								</Label>
								<p className="text-xs text-muted-foreground mt-0.5">
									Context, Aims, and Implications are always carried forward.
									Checking this also copies Progress and Future Directions.
								</p>
							</div>
						</div>

						<div className="border-t pt-3 mt-3">
							<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
								Send Announcement Emails To
							</p>
							<div className="flex flex-wrap gap-x-6 gap-y-2">
								<div className="flex items-center gap-2">
									<Checkbox
										id="ar-send-ba-leads"
										checked={sendBaLeads}
										onCheckedChange={(checked) =>
											setSendBaLeads(checked === true)
										}
									/>
									<Label
										htmlFor="ar-send-ba-leads"
										className="text-sm cursor-pointer"
									>
										Business Area Leads
									</Label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id="ar-send-project-leads"
										checked={sendProjectLeads}
										onCheckedChange={(checked) =>
											setSendProjectLeads(checked === true)
										}
									/>
									<Label
										htmlFor="ar-send-project-leads"
										className="text-sm cursor-pointer"
									>
										Project Leads
									</Label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id="ar-send-team-members"
										checked={sendTeamMembers}
										onCheckedChange={(checked) =>
											setSendTeamMembers(checked === true)
										}
									/>
									<Label
										htmlFor="ar-send-team-members"
										className="text-sm cursor-pointer"
									>
										Project Team
									</Label>
								</div>
							</div>
							<p className="text-xs text-muted-foreground mt-1.5">
								Only active DBCA staff (@dbca.wa.gov.au) will receive emails.
								Users appearing in multiple roles receive one email under their
								highest role.
							</p>
						</div>
					</div>

					{anySendGroup && recipientPreview && (
						<RecipientPreviewPanel
							baLeads={filteredBaLeads}
							projectLeads={filteredProjectLeads}
							teamMembers={filteredTeamMembers}
							excludedUserIds={excludedUserIds}
							onExcludeUser={handleExcludeUser}
							onRestoreUser={handleRestoreUser}
						/>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							className={
								isEmailOnly
									? "bg-blue-600 hover:bg-blue-700 text-white"
									: undefined
							}
							disabled={!hasAnySelection || newCycleMutation.isPending}
							onClick={() => {
								newCycleMutation.mutate(
									{
										division: divisionSlug,
										update: includeUpdating,
										prepopulate,
										send_emails: anySendGroup,
										recipient_groups: anySendGroup ? selectedGroups : undefined,
										excluded_user_ids:
											excludedUserIds.length > 0 ? excludedUserIds : undefined,
									},
									{ onSuccess: onClose }
								);
							}}
						>
							{newCycleMutation.isPending
								? isEmailOnly
									? "Sending..."
									: "Opening..."
								: isEmailOnly
									? "Send Announcement"
									: "Open New Cycle"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
