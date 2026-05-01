import { useState } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { UserSearchDropdown } from "@/shared/components/user/UserSearchDropdown";
import {
	useEmailTestingSettings,
	useUpdateEmailTestingSettings,
	useSendAllTestEmails,
} from "@/features/admin/hooks/useEmailTestingSettings";

/** All available email templates with human-readable labels */
const EMAIL_TEMPLATES = [
	{ name: "document_approved_email", label: "Document Approved" },
	{
		name: "document_approved_directorate_email",
		label: "Document Approved (Directorate)",
	},
	{ name: "document_recalled_email", label: "Document Recalled" },
	{ name: "document_sent_back_email", label: "Document Sent Back" },
	{ name: "document_ready_email", label: "Document Ready for Review" },
	{ name: "feedback_received_email", label: "Feedback Received" },
	{ name: "review_document_email", label: "Review Requested" },
	{ name: "bump_email", label: "Bump Reminder (Single)" },
	{ name: "bump_consolidated_email", label: "Bump Reminder (Consolidated)" },
	{
		name: "batch_approved_consolidated_email",
		label: "Batch Approval (Consolidated)",
	},
	{ name: "document_comment_mention", label: "Comment Mention" },
	{ name: "new_comment_email", label: "New Comment" },
	{ name: "new_cycle_open_email", label: "New Cycle Open" },
	{ name: "project_closed_email", label: "Project Closed" },
	{ name: "project_reopened_email", label: "Project Reopened" },
	{ name: "spms_link_email", label: "SPMS Invite" },
	{ name: "staff_profile_email", label: "Staff Profile Contact" },
] as const;

const EmailTestingPage = () => {
	useDocumentTitle("Email Testing");

	const { data: settings, isLoading } = useEmailTestingSettings();
	const { mutate: updateSettings, isPending } = useUpdateEmailTestingSettings();
	const { mutate: sendEmails, isPending: isSendingAll } =
		useSendAllTestEmails();

	const [testingMode, setTestingMode] = useState(false);
	const [testUserId, setTestUserId] = useState<number | null>(null);
	const [recipientUserId, setRecipientUserId] = useState<number | null>(null);
	const [actionerUserId, setActionerUserId] = useState<number | null>(null);
	const [hasInitialised, setHasInitialised] = useState(false);
	const [sendingTemplate, setSendingTemplate] = useState<string | null>(null);

	// Sync local state from server settings on first load
	if (settings && !hasInitialised) {
		setTestingMode(settings.email_testing_mode);
		setTestUserId(settings.email_test_user?.id ?? null);
		setHasInitialised(true);
	}

	const hasChanges =
		settings &&
		(testingMode !== settings.email_testing_mode ||
			testUserId !== (settings.email_test_user?.id ?? null));

	const isValid = !testingMode || testUserId !== null;

	const canSendEmails =
		settings?.email_testing_mode && settings?.email_test_user;

	const handleSave = () => {
		updateSettings({
			email_testing_mode: testingMode,
			email_test_user: testingMode ? testUserId : null,
		});
	};

	const handleSendAll = () => {
		sendEmails({
			recipient_user_id: recipientUserId,
			actioner_user_id: actionerUserId,
		});
	};

	const handleSendSingle = (templateName: string) => {
		setSendingTemplate(templateName);
		sendEmails(
			{
				recipient_user_id: recipientUserId,
				actioner_user_id: actionerUserId,
				template_name: templateName,
			},
			{
				onSettled: () => setSendingTemplate(null),
			}
		);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto space-y-6 p-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					Email Testing
				</h1>
				<p className="text-sm text-gray-500">Loading settings...</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-6 p-6">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Email Testing
			</h1>

			{/* Status banner */}
			{settings?.email_testing_mode && settings.email_test_user && (
				<div className="rounded-md border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
					<p className="text-sm font-medium text-amber-800 dark:text-amber-200">
						Testing mode is ON — all emails will be sent to{" "}
						{settings.email_test_user.display_first_name}{" "}
						{settings.email_test_user.display_last_name} (
						{settings.email_test_user.email})
					</p>
				</div>
			)}

			{/* Settings and overrides — side by side on desktop */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Testing Mode Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Testing Mode</CardTitle>
						<CardDescription>
							Redirect all outgoing emails to a single test user
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="testing-mode" className="text-base font-medium">
									Email Testing Mode
								</Label>
								<p className="text-sm text-gray-500 dark:text-gray-400">
									When enabled, all emails go to the test user below
								</p>
							</div>
							<Switch
								id="testing-mode"
								checked={testingMode}
								onCheckedChange={setTestingMode}
								className="data-[state=checked]:bg-green-600"
							/>
						</div>

						{testingMode && (
							<UserSearchDropdown
								label="Test User"
								placeholder="Search for a superuser..."
								helperText="All emails will be redirected to this user"
								isRequired={true}
								onlyInternal={true}
								setUserFunction={setTestUserId}
								preselectedUserPk={testUserId ?? undefined}
							/>
						)}

						<div className="flex justify-end pt-2">
							<Button
								onClick={handleSave}
								disabled={!hasChanges || !isValid || isPending}
							>
								{isPending ? "Saving..." : "Save"}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* User overrides and Send All */}
				<Card>
					<CardHeader>
						<CardTitle>Custom Context</CardTitle>
						<CardDescription>
							Optionally set real users for the recipient and actioner fields to
							see realistic email content
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{!canSendEmails && (
							<p className="text-sm text-amber-600 dark:text-amber-400">
								Enable testing mode and set a test user before sending.
							</p>
						)}

						{canSendEmails && (
							<>
								<UserSearchDropdown
									label="Recipient name"
									placeholder="Use default sample name..."
									helperText="Overrides the recipient name in all templates"
									isRequired={false}
									onlyInternal={true}
									setUserFunction={setRecipientUserId}
									preselectedUserPk={recipientUserId ?? undefined}
								/>
								<UserSearchDropdown
									label="Actioner / sender name"
									placeholder="Use default sample name..."
									helperText="Overrides the actioning user name in all templates"
									isRequired={false}
									onlyInternal={true}
									setUserFunction={setActionerUserId}
									preselectedUserPk={actionerUserId ?? undefined}
								/>
							</>
						)}

						<div className="flex justify-end pt-2">
							<Button
								onClick={handleSendAll}
								disabled={!canSendEmails || isSendingAll}
								className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
							>
								{isSendingAll && !sendingTemplate
									? "Sending all..."
									: "Send All Emails"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Template grid */}
			<div className="space-y-4">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					Email Templates
				</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{EMAIL_TEMPLATES.map((template) => (
						<Card key={template.name} className="py-4">
							<CardContent className="flex items-center justify-between gap-3 pb-0">
								<div className="min-w-0">
									<p className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{template.label}
									</p>
									<p className="truncate text-xs text-gray-500 dark:text-gray-400">
										{template.name}
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleSendSingle(template.name)}
									disabled={!canSendEmails || sendingTemplate === template.name}
									className="shrink-0"
								>
									{sendingTemplate === template.name ? "Sending..." : "Send"}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
};

export default EmailTestingPage;
