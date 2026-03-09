import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { FileText } from "lucide-react";

interface SeekEndorsementModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (shouldSendEmails: boolean) => void;
	isLoading?: boolean;
	aecEndorsementRequired: boolean;
	aecEndorsementProvided: boolean;
	uploadedPDFName?: string;
}

export function SeekEndorsementModal({
	isOpen,
	onClose,
	onConfirm,
	isLoading,
	aecEndorsementRequired,
	aecEndorsementProvided,
	uploadedPDFName,
}: SeekEndorsementModalProps) {
	const [shouldSendEmails, setShouldSendEmails] = useState(false);

	// Determine if emails are necessary
	const emailsNecessary = aecEndorsementRequired && !aecEndorsementProvided;

	const handleConfirm = () => {
		onConfirm(shouldSendEmails);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Save Endorsements</DialogTitle>
					<DialogDescription>
						{emailsNecessary
							? "Also send notifications?"
							: "As all required endorsements have been provided, no emails are necessary. You may still save."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Send Notifications Checkbox */}
					<div className="flex items-center space-x-2">
						<Checkbox
							id="send-emails"
							checked={shouldSendEmails}
							onCheckedChange={(checked) => setShouldSendEmails(!!checked)}
							disabled={!emailsNecessary}
						/>
						<Label htmlFor="send-emails" className="cursor-pointer">
							Send Notifications
						</Label>
					</div>

					{/* Email notification details */}
					{shouldSendEmails && emailsNecessary && (
						<div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
							<ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
								<li>
									As Animal Ethics Committee endorsement is marked as required
									but it has yet to be provided, an email will be sent to Animal
									Ethics Committee approvers to approve or reject this plan
								</li>
							</ul>
						</div>
					)}

					{/* PDF upload notification */}
					{uploadedPDFName && (
						<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
							<p className="text-sm font-medium text-green-700 mb-2">
								You are uploading the following file to provide AEC approval:
							</p>
							<div className="flex items-center gap-2 mt-2">
								<FileText className="h-5 w-5 text-red-500" />
								<span className="text-sm text-gray-700">{uploadedPDFName}</span>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button onClick={handleConfirm} disabled={isLoading}>
						{isLoading
							? "Saving..."
							: shouldSendEmails
								? "Save and Send Emails"
								: "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
