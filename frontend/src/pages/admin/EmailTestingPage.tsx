import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { UserSearchDropdown } from "@/shared/components/user/UserSearchDropdown";
import {
	useEmailTestingSettings,
	useUpdateEmailTestingSettings,
	useSendTestEmail,
	useSendAllTestEmails,
} from "@/features/admin/hooks/useEmailTestingSettings";

const EmailTestingPage = () => {
	useDocumentTitle("Email Testing");

	const { data: settings, isLoading } = useEmailTestingSettings();
	const { mutate: updateSettings, isPending } = useUpdateEmailTestingSettings();
	const { mutate: sendTest, isPending: isSending } = useSendTestEmail();
	const { mutate: sendAll, isPending: isSendingAll } = useSendAllTestEmails();

	const [testingMode, setTestingMode] = useState(false);
	const [testUserId, setTestUserId] = useState<number | null>(null);
	const [recipientUserId, setRecipientUserId] = useState<number | null>(null);
	const [actionerUserId, setActionerUserId] = useState<number | null>(null);

	useEffect(() => {
		if (settings) {
			setTestingMode(settings.email_testing_mode);
			setTestUserId(settings.email_test_user?.id ?? null);
		}
	}, [settings]);

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

			{/* Cards grid — side by side on desktop, stacked on mobile */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Testing Mode Settings */}
				<div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Testing Mode
					</h2>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="testing-mode" className="text-base font-medium">
								Email Testing Mode
							</Label>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Redirect all outgoing emails to a single test user
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
						<div className="space-y-2">
							<UserSearchDropdown
								label="Test User"
								placeholder="Search for a superuser..."
								helperText="All emails will be redirected to this user"
								isRequired={true}
								onlyInternal={true}
								setUserFunction={setTestUserId}
								preselectedUserPk={testUserId ?? undefined}
							/>
						</div>
					)}

					<div className="flex justify-end pt-2">
						<Button
							onClick={handleSave}
							disabled={!hasChanges || !isValid || isPending}
						>
							{isPending ? "Saving..." : "Save"}
						</Button>
					</div>
				</div>

				{/* Email Preview */}
				<div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Email Preview
					</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Send test emails to verify templates render correctly. Optionally
						set real users for the recipient and actioner fields to see
						realistic email content.
					</p>

					{!canSendEmails && (
						<p className="text-sm text-amber-600 dark:text-amber-400">
							Enable testing mode and set a test user above before sending.
						</p>
					)}

					{/* User overrides for realistic test emails */}
					{canSendEmails && (
						<div className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
							<p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								Custom context (optional)
							</p>
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
						</div>
					)}

					<div className="flex gap-3 pt-2">
						<Button
							variant="outline"
							onClick={() => sendTest()}
							disabled={!canSendEmails || isSending}
							className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900"
						>
							{isSending ? "Sending..." : "Send Test Email"}
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								sendAll({
									recipient_user_id: recipientUserId,
									actioner_user_id: actionerUserId,
								})
							}
							disabled={!canSendEmails || isSendingAll}
							className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900"
						>
							{isSendingAll ? "Sending all..." : "Send All Emails"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailTestingPage;
