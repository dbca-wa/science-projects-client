import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
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

type TabValue = "unapproved" | "problematic";

const TAB_PATHS: Record<TabValue, string> = {
	unapproved: "/manage/data/unapproved",
	problematic: "/manage/data/problematic",
};

/**
 * Tabbed interface for admin data lists.
 * Tabs are URL-routed so the active tab persists across navigation.
 * Each tab shows a count badge with the number of issues.
 */
export const DataListsTabs = () => {
	const navigate = useNavigate();
	const location = useLocation();

	// Determine active tab from URL path
	const activeTab: TabValue = location.pathname.includes("/problematic")
		? "problematic"
		: "unapproved";

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
		navigate(TAB_PATHS[tab], { replace: true });
	};

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
			{/* Desktop tabs */}
			<TabsList className="hidden w-full justify-start md:inline-flex">
				<TabsTrigger value="unapproved">
					<span className="flex items-center gap-2">
						Unapproved Projects
						{unapprovedCount > 0 && (
							<Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs">
								{unapprovedCount}
							</Badge>
						)}
					</span>
				</TabsTrigger>
				<TabsTrigger value="problematic">
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
						<SelectItem value="unapproved">
							Unapproved Projects ({unapprovedCount})
						</SelectItem>
						<SelectItem value="problematic">
							Problematic Projects ({problematicCount})
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<TabsContent value="unapproved">
				<UnapprovedDocsTab />
			</TabsContent>
			<TabsContent value="problematic">
				<ProblematicProjectsTab />
			</TabsContent>
		</Tabs>
	);
};
