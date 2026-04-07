import { useState } from "react";
import { useMediaQuery } from "@/shared/hooks/ui/useMediaQuery";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import OverviewSection from "./OverviewSection";
import ProjectsSection from "./ProjectsSection";
import CVSection from "./CVSection";
import PublicationsSection from "./PublicationsSection";

interface StaffContentTabsProps {
	profilePk: number;
	userId: number;
	canEdit: boolean;
	employeeId: number;
}

const TABS = ["Overview", "Projects", "CV", "Publications"] as const;
type Tab = (typeof TABS)[number];

const TAB_COLOURS: Record<Tab, string> = {
	Overview: "#2A6096",
	Projects: "#01A7B2",
	CV: "#FFC530",
	Publications: "#1E5456",
};

const StaffContentTabs = ({
	profilePk,
	userId,
	canEdit,
}: StaffContentTabsProps) => {
	const [activeTab, setActiveTab] = useState<Tab>("Overview");
	const isMobile = !useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);

	const getLabel = (tab: Tab) => {
		if (!isMobile) return tab;
		if (tab === "Overview") return "Details";
		if (tab === "Publications") return "Papers";
		return tab;
	};

	return (
		<div className="mx-auto w-full">
			<div
				className={`flex overflow-x-auto no-scrollbar mt-2 px-4 ${isMobile ? "justify-center" : ""}`}
				style={{ unicodeBidi: "isolate" }}
				role="tablist"
			>
				{TABS.map((tab) => {
					const isActive = activeTab === tab;
					const colour = TAB_COLOURS[tab];
					return (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							role="tab"
							aria-selected={isActive}
							className={`relative px-4 py-3 text-base cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors ${isMobile ? "shrink-0" : "flex-1 text-center"} ${isActive ? "font-semibold" : "font-normal"}`}
							style={{
								color: isActive ? "#1e293b" : "#94a3b8",
								borderBottom: `${isActive ? 8 : 4}px solid ${colour}`,
							}}
						>
							{getLabel(tab)}
						</button>
					);
				})}
			</div>

			<div className="pt-4 pb-16">
				{activeTab === "Overview" && (
					<OverviewSection profilePk={profilePk} canEdit={canEdit} />
				)}
				{activeTab === "Projects" && <ProjectsSection userId={userId} />}
				{activeTab === "CV" && (
					<CVSection profilePk={profilePk} canEdit={canEdit} />
				)}
				{activeTab === "Publications" && <PublicationsSection />}
			</div>
		</div>
	);
};

export default StaffContentTabs;
