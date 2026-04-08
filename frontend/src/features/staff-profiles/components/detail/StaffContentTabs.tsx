import { useLocation, useNavigate, useParams } from "react-router";
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
	employeeId: string | null;
}

const TABS = ["Overview", "Projects", "CV", "Publications"] as const;
type Tab = (typeof TABS)[number];

const TAB_COLOURS: Record<Tab, string> = {
	Overview: "#2A6096",
	Projects: "#01A7B2",
	CV: "#FFC530",
	Publications: "#1E5456",
};

const TAB_PATHS: Record<Tab, string> = {
	Overview: "",
	Projects: "/projects",
	CV: "/background",
	Publications: "/publications",
};

const getTabFromPath = (pathname: string): Tab => {
	if (pathname.endsWith("/projects")) return "Projects";
	if (pathname.endsWith("/background")) return "CV";
	if (pathname.endsWith("/publications")) return "Publications";
	return "Overview";
};

const StaffContentTabs = ({
	profilePk,
	userId,
	canEdit,
	employeeId,
}: StaffContentTabsProps) => {
	const { staffProfilePk } = useParams<{ staffProfilePk: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const isMobile = !useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);

	// Derive active tab directly from URL — no state needed
	const activeTab = getTabFromPath(location.pathname);

	const handleTabChange = (tab: Tab) => {
		const basePath = `/staff/${staffProfilePk}`;
		navigate(`${basePath}${TAB_PATHS[tab]}`);
	};

	const getLabel = (tab: Tab) => {
		if (!isMobile) return tab === "CV" ? "Background" : tab;
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
							onClick={() => handleTabChange(tab)}
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
				{activeTab === "Publications" && (
					<PublicationsSection employeeId={employeeId} />
				)}
			</div>
		</div>
	);
};

export default StaffContentTabs;
