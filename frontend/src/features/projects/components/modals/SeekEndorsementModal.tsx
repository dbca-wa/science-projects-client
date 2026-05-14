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
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { FileText, Mail, Info } from "lucide-react";
import { SuccessAnimation } from "@/shared/components/SuccessAnimation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/services/api/client.service";

interface AecRecipient {
	name: string;
	email: string;
	role: string;
}

interface AecRecipientsResponse {
	recipients: AecRecipient[];
	role_label: string;
}

interface SeekEndorsementModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (shouldSendEmails: boolean) => void;
	isLoading?: boolean;
	isSuccess?: boolean;
	aecEndorsementRequired: boolean;
	aecEndorsementProvided: boolean;
	uploadedPDFName?: string;
	projectPlanId: number;
}

export const SeekEndorsementModal = ({
	isOpen,
	onClose,
	onConfirm,
	isLoading,
	isSuccess = false,
	aecEndorsementRequired,
	aecEndorsementProvided,
	uploadedPDFName,
	projectPlanId,
}: SeekEndorsementModalProps) => {
	const [shouldSendEmails, setShouldSendEmails] = useState(true);

	// Determine if emails are relevant (endorsement required but not yet provided)
	const emailsRelevant = aecEndorsementRequired && !aecEndorsementProvided;

	// Fetch AEC recipients when emails are relevant
	const { data: recipientsData, isLoading: recipientsLoading } = useQuery({
		queryKey: ["aec-recipients", projectPlanId],
		queryFn: () =>
			apiClient.get<AecRecipientsResponse>(
				`documents/project_plans/${projectPlanId}/seek_endorsement`
			),
		enabled: isOpen && emailsRelevant,
		staleTime: 30_000,
	});

	const handleConfirm = () => {
		onConfirm(shouldSendEmails && emailsRelevant);
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={isLoading || isSuccess ? () => {} : onClose}
		>
			<DialogContent className="sm:max-w-2xl">
				{isSuccess ? (
					<SuccessAnimation
						title="Endorsements saved"
						subtitle={
							shouldSendEmails && emailsRelevant
								? "Notification sent to AEC members."
								: undefined
						}
						duration={1500}
					/>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Save Endorsements</DialogTitle>
							<DialogDescription>
								{emailsRelevant
									? "Review the changes and choose whether to notify AEC members."
									: "All required endorsements have been provided. Save to update the record."}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							{/* PDF upload notification */}
							{uploadedPDFName && (
								<div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4">
									<p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
										Uploading AEC approval PDF:
									</p>
									<div className="flex items-center gap-2">
										<FileText className="h-5 w-5 text-red-500" />
										<span className="text-sm text-gray-700 dark:text-gray-300">
											{uploadedPDFName}
										</span>
									</div>
								</div>
							)}

							{/* Recipient Display — show who will be notified */}
							{emailsRelevant && (
								<div className="space-y-2">
									{recipientsLoading && (
										<div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-48" />
										</div>
									)}

									{recipientsData?.recipients &&
										recipientsData.recipients.length > 0 && (
											<div className="rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
												<div className="flex items-center gap-2 mb-3">
													<Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
													<p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
														{recipientsData.role_label}
													</p>
												</div>
												<div className="space-y-2">
													{recipientsData.recipients.map((r, i) => (
														<div
															key={i}
															className="flex items-center gap-2 rounded-md bg-white dark:bg-gray-800/60 px-3 py-2 border border-gray-100 dark:border-gray-700/50"
														>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
																	{r.name}
																</p>
																<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
																	{r.email}
																</p>
															</div>
															<span className="shrink-0 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
																{r.role}
															</span>
														</div>
													))}
												</div>
											</div>
										)}

									{recipientsData?.recipients?.length === 0 && (
										<Alert>
											<Info className="h-4 w-4" />
											<AlertDescription>
												No AEC members are configured in the system. The
												endorsement will be saved without sending notifications.
											</AlertDescription>
										</Alert>
									)}
								</div>
							)}

							{/* Send Notifications Checkbox */}
							{emailsRelevant && (
								<div className="flex items-center space-x-2">
									<Checkbox
										id="send-emails"
										checked={shouldSendEmails}
										onCheckedChange={(checked) =>
											setShouldSendEmails(!!checked)
										}
										disabled={!recipientsData?.recipients?.length}
									/>
									<Label
										htmlFor="send-emails"
										className="cursor-pointer text-sm"
									>
										Send email notification to AEC members
									</Label>
								</div>
							)}
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={onClose} disabled={isLoading}>
								Cancel
							</Button>
							<Button
								onClick={handleConfirm}
								disabled={isLoading}
								className="bg-green-600 hover:bg-green-700 text-white"
							>
								{isLoading
									? "Saving..."
									: shouldSendEmails && emailsRelevant
										? "Save and Notify"
										: "Save"}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};
