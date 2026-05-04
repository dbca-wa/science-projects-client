import { useState, useMemo } from "react";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { UnapprovedDocsTab } from "./UnapprovedDocsTab";
import { ProblematicProjectsTab } from "./ProblematicProjectsTab";
import {
	useUnapprovedDocs,
	useProblematicProjects,
} from "../../hooks/useDataLists";

type TabValue = "unapproved-docs" | "problematic-projects";

/**
 * Tabbed interface for admin data lists.
 * Tabs are lazily loaded on first visit and retained to avoid re-fetching.
 * Each tab shows a count badge with the number of issues.
 */
export const DataListsTabs = () => {
	const [activeTab, setActiveTab] = useState<TabValue>("unapproved-docs");
	const [loadedTabs, setLoadedTabs] = useState(
		new Set<TabValue>(["unapproved-docs"])
	);

	const { data: unapprovedDocs } = useUnapprovedDocs();
	const { data: problematicData } = useProblematicProjects();

	const unapprovedCount = unapprovedDocs?.length ?? 0;
	const problematicCount = useMemo(() => {
		if (!problematicData) return 0;
		return Object.values(problematicData).reduce(
			(sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
			0
		);
	}, [problematicData]);

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
			{/* Desktop tabs */}
			<TabsList className="hidden w-full justify-start md:inline-flex">
				<TabsTrigger value="unapproved-docs">
					<span className="flex items-center gap-2">
						Unapproved Docs
						{unapprovedCount > 0 && (
							<Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
								{unapprovedCount}
							</Badge>
						)}
					</span>
				</TabsTrigger>
				<TabsTrigger value="problematic-projects">
					<span className="flex items-center gap-2">
						Problematic Projects
						{problematicCount > 0 && (
							<Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
								{problematicCount}
							</Badge>
						)}
					</span>
				</TabsTrigger>
			</TabsList>

			{/* Mobile dropdown */}
			<div className="md:hidden">
				<Select value={activeTab} onValueChange={handleTabChange}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select a tab" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="unapproved-docs">
							Unapproved Docs ({unapprovedCount})
						</SelectItem>
						<SelectItem value="problematic-projects">
							Problematic Projects ({problematicCount})
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<TabsContent value="unapproved-docs">
				{loadedTabs.has("unapproved-docs") && <UnapprovedDocsTab />}
			</TabsContent>
			<TabsContent value="problematic-projects">
				{loadedTabs.has("problematic-projects") && <ProblematicProjectsTab />}
			</TabsContent>
		</Tabs>
	);
};
