import { useState } from "react";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import { UnapprovedDocsTab } from "./UnapprovedDocsTab";
import { ProblematicProjectsTab } from "./ProblematicProjectsTab";
import { EmailListTab } from "./EmailListTab";
import { StaffProfileListTab } from "./StaffProfileListTab";
import { StaffUsersTab } from "./StaffUsersTab";

const TAB_CONFIG = [
	{ value: "unapproved-docs", label: "Unapproved Docs" },
	{ value: "problematic-projects", label: "Problematic Projects" },
	{ value: "email-list", label: "Email List" },
	{ value: "staff-profiles", label: "Staff Profile List" },
	{ value: "staff-users", label: "Staff Users" },
] as const;

type TabValue = (typeof TAB_CONFIG)[number]["value"];

/**
 * Tabbed interface for admin data lists.
 * Tabs are lazily loaded on first visit and retained to avoid re-fetching.
 */
export function DataListsTabs() {
	const [activeTab, setActiveTab] = useState<TabValue>("unapproved-docs");
	const [loadedTabs, setLoadedTabs] = useState(
		new Set<TabValue>(["unapproved-docs"])
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
				{TAB_CONFIG.map((tab) => (
					<TabsTrigger key={tab.value} value={tab.value}>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>

			<TabsContent value="unapproved-docs">
				{loadedTabs.has("unapproved-docs") && <UnapprovedDocsTab />}
			</TabsContent>
			<TabsContent value="problematic-projects">
				{loadedTabs.has("problematic-projects") && <ProblematicProjectsTab />}
			</TabsContent>
			<TabsContent value="email-list">
				{loadedTabs.has("email-list") && <EmailListTab />}
			</TabsContent>
			<TabsContent value="staff-profiles">
				{loadedTabs.has("staff-profiles") && <StaffProfileListTab />}
			</TabsContent>
			<TabsContent value="staff-users">
				{loadedTabs.has("staff-users") && <StaffUsersTab />}
			</TabsContent>
		</Tabs>
	);
}
