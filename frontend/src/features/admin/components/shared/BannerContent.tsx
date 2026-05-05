import { useState } from "react";
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
import { RichTextEditor } from "@/shared/components/editor";
import {
	useHomepageBanner,
	useUpdateHomepageBanner,
} from "@/features/admin/hooks/useHomepageBanner";

/**
 * Admin tab content for configuring the homepage banner.
 * Toggle on/off and set the message via rich text editor.
 */
export const BannerContent = () => {
	const { data: settings } = useHomepageBanner();
	const { mutate: updateBanner, isPending } = useUpdateHomepageBanner();

	const [showMessage, setShowMessage] = useState(false);
	const [message, setMessage] = useState("");
	const [hasInitialised, setHasInitialised] = useState(false);

	// Sync local state from server on first load
	if (settings && !hasInitialised) {
		setShowMessage(settings.show_homepage_message);
		setMessage(settings.homepage_message || "");
		setHasInitialised(true);
	}

	const hasChanges =
		settings &&
		(showMessage !== settings.show_homepage_message ||
			message !== (settings.homepage_message || ""));

	const handleSave = () => {
		updateBanner({
			show_homepage_message: showMessage,
			homepage_message: showMessage ? message : "",
		});
	};

	return (
		<div className="space-y-6">
			{/* Status banner */}
			{settings?.show_homepage_message && settings.homepage_message && (
				<div className="rounded-md border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950">
					<p className="text-sm font-medium text-blue-800 dark:text-blue-200">
						Banner is currently ON — all users see the message on the dashboard.
					</p>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Homepage Banner</CardTitle>
					<CardDescription>
						Display a message above the welcome section on the dashboard for all
						users
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label htmlFor="banner-toggle" className="text-base font-medium">
								Show Banner
							</Label>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								When enabled, the message below is displayed on the dashboard
							</p>
						</div>
						<Switch
							id="banner-toggle"
							checked={showMessage}
							onCheckedChange={setShowMessage}
							className="data-[state=checked]:bg-green-600"
						/>
					</div>

					{showMessage && (
						<div className="space-y-2">
							<Label className="text-sm font-medium">Banner Message</Label>
							<RichTextEditor
								value={message}
								onChange={setMessage}
								toolbar="newCycle"
								placeholder="Enter the banner message..."
								aria-label="Homepage banner message"
								className="editor-standalone"
								minHeight="120px"
							/>
						</div>
					)}

					<div className="flex justify-end pt-2">
						<Button onClick={handleSave} disabled={!hasChanges || isPending}>
							{isPending ? "Saving..." : "Save"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
