import { useState } from "react";
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
	useBatchApprove,
	useBatchApproveOld,
} from "@/shared/hooks/queries/useBumpEmails";
import type { ARActionId } from "./ManageDropdownContent";

interface ARActionDialogsProps {
	activeAction: ARActionId | null;
	onClose: () => void;
	divisionSlug?: string;
}

/**
 * Reusable AR Action confirmation dialogs for batch approve actions.
 * Used by both the Header (manage dropdown) and MyDivisionView.
 *
 * Note: The "Open New Cycle" action now navigates to a dedicated page
 * at /manage/new-cycle instead of opening a dialog.
 */
export const ARActionDialogs = ({
	activeAction,
	onClose,
	divisionSlug,
}: ARActionDialogsProps) => {
	const [baSendNotifications, setBaSendNotifications] = useState(false);
	const [baOldSendNotifications, setBaOldSendNotifications] = useState(false);

	const batchApproveMutation = useBatchApprove();
	const batchApproveOldMutation = useBatchApproveOld();

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
		</>
	);
};
