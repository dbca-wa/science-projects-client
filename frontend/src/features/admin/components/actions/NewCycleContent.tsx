import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { useOpenNewCycle } from "../../hooks/useAdminActions";
import { useNewCyclePreview } from "@/shared/hooks/queries/useBumpEmails";
import { RecipientPreviewPanel } from "@/shared/components/layout/RecipientPreviewPanel";

interface NewCycleContentProps {
	divisionSlug?: string;
}

/** Content for the Open New Cycle standalone page. */
export const NewCycleContent = ({ divisionSlug }: NewCycleContentProps) => {
	const { mutate, isPending } = useOpenNewCycle();
	const [includeUpdating, setIncludeUpdating] = useState(false);
	const [prepopulate, setPrepopulate] = useState(false);
	const [sendBaLeads, setSendBaLeads] = useState(false);
	const [sendProjectLeads, setSendProjectLeads] = useState(false);
	const [sendTeamMembers, setSendTeamMembers] = useState(false);

	const anySendGroup = sendBaLeads || sendProjectLeads || sendTeamMembers;
	const isEmailOnly = anySendGroup && !includeUpdating && !prepopulate;
	const hasAnySelection = includeUpdating || prepopulate || anySendGroup;

	const selectedGroups = [
		...(sendBaLeads ? ["ba_leads"] : []),
		...(sendProjectLeads ? ["project_leads"] : []),
		...(sendTeamMembers ? ["team_members"] : []),
	];

	const { data: recipientPreview } = useNewCyclePreview(
		anySendGroup,
		divisionSlug
	);

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

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
				<div className="flex items-start gap-4">
					<RefreshCw className="size-8 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
					<div className="space-y-2">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Open New Cycle
						</h2>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							This action will open a new annual reporting cycle. Ensure the
							previous cycle has been finalised before proceeding.
						</p>
						<p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-md px-3 py-2">
							Ensure an Annual Report has been created for the target year. If
							the cycle has already been opened, you can re-run this to send
							announcement emails only.
						</p>
					</div>
				</div>

				<div className="mt-5 space-y-3">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						Report Creation
					</p>
					<div className="flex items-start gap-2">
						<Checkbox
							id="page-include-updating"
							checked={includeUpdating}
							onCheckedChange={(checked) =>
								setIncludeUpdating(checked === true)
							}
						/>
						<div>
							<Label
								htmlFor="page-include-updating"
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
							id="page-prepopulate"
							checked={prepopulate}
							onCheckedChange={(checked) => setPrepopulate(checked === true)}
						/>
						<div>
							<Label
								htmlFor="page-prepopulate"
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
									id="page-send-ba-leads"
									checked={sendBaLeads}
									onCheckedChange={(checked) =>
										setSendBaLeads(checked === true)
									}
								/>
								<Label
									htmlFor="page-send-ba-leads"
									className="text-sm cursor-pointer"
								>
									Business Area Leads
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="page-send-project-leads"
									checked={sendProjectLeads}
									onCheckedChange={(checked) =>
										setSendProjectLeads(checked === true)
									}
								/>
								<Label
									htmlFor="page-send-project-leads"
									className="text-sm cursor-pointer"
								>
									Project Leads
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Checkbox
									id="page-send-team-members"
									checked={sendTeamMembers}
									onCheckedChange={(checked) =>
										setSendTeamMembers(checked === true)
									}
								/>
								<Label
									htmlFor="page-send-team-members"
									className="text-sm cursor-pointer"
								>
									Project Team
								</Label>
							</div>
						</div>
						<p className="text-xs text-muted-foreground mt-1.5">
							Only active DBCA staff (@dbca.wa.gov.au) will receive emails.
						</p>
					</div>
				</div>

				{anySendGroup && recipientPreview && (
					<div className="mt-4">
						<RecipientPreviewPanel
							baLeads={filteredBaLeads}
							projectLeads={filteredProjectLeads}
							teamMembers={filteredTeamMembers}
						/>
					</div>
				)}

				<div className="mt-6 flex justify-end">
					<Button
						onClick={() =>
							mutate({
								division: divisionSlug,
								update: includeUpdating,
								prepopulate,
								send_emails: anySendGroup,
								recipient_groups: anySendGroup ? selectedGroups : undefined,
							})
						}
						disabled={!hasAnySelection || isPending}
						className={
							isEmailOnly
								? "bg-blue-600 hover:bg-blue-700 text-white"
								: undefined
						}
					>
						{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
						{isEmailOnly ? "Send Announcement" : "Open New Cycle"}
					</Button>
				</div>
			</div>
		</div>
	);
};
