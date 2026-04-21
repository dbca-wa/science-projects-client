import { useState } from "react";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import { useAuthStore } from "@/app/stores/store-context";
import { observer } from "mobx-react-lite";
import { DivisionalEmailListsTab } from "./DivisionalEmailListsTab";

type TabValue = "divisional-emails" | "email-styling";

/**
 * Tabbed layout for the Email admin page.
 * Shows divisional directorate email lists for all admins,
 * and an email styling tab for system maintainers only.
 */
export const EmailPageContent = observer(function EmailPageContent() {
	const authStore = useAuthStore();
	const showStylingTab = authStore.isSuperuser;

	const [activeTab, setActiveTab] = useState<TabValue>("divisional-emails");
	const [loadedTabs, setLoadedTabs] = useState(
		new Set<TabValue>(["divisional-emails"])
	);

	const handleTabChange = (value: string) => {
		const tab = value as TabValue;
		setLoadedTabs((prev) => {
			if (prev.has(tab)) return prev;
			const next = new Set(prev);
			next.add(tab);
			return next;
		});
		setActiveTab(tab);
	};

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
			<TabsList className="w-full flex flex-wrap">
				<TabsTrigger value="divisional-emails">
					Divisional Directorate Email Lists
				</TabsTrigger>
				{showStylingTab && (
					<TabsTrigger value="email-styling">Email Styling Page</TabsTrigger>
				)}
			</TabsList>

			<TabsContent value="divisional-emails">
				{loadedTabs.has("divisional-emails") && <DivisionalEmailListsTab />}
			</TabsContent>

			{showStylingTab && (
				<TabsContent value="email-styling">
					{loadedTabs.has("email-styling") && <EmailStylingPlaceholder />}
				</TabsContent>
			)}
		</Tabs>
	);
});

/** Placeholder for the email styling functionality */
// eslint-disable-next-line react-refresh/only-export-components
function EmailStylingPlaceholder() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<p className="text-muted-foreground">
				Email styling functionality will be available here.
			</p>
		</div>
	);
}
