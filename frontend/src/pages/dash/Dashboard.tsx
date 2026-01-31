import { useState } from "react";
import { useCurrentUser } from "@/features/auth";
import { 
	useAdminTasks, 
	useEndorsementTasks, 
	useDocumentTasks,
	MyTasksSection,
	DocumentTasksTabContent,
} from "@/features/dashboard";
import { useMyProjects } from "@/features/projects/hooks/useMyProjects";
import { ProjectsDataTable } from "@/features/projects/components/ProjectsDataTable";
import { useMyProjectsStore } from "@/app/stores/store-context";
import { observer } from "mobx-react-lite";
import { FaQuestionCircle, FaDatabase, FaSearch } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { MdFeedback } from "react-icons/md";
import { useSearchParams, useNavigate } from "react-router";
import { DashboardActionCard } from "@/features/dashboard/components/DashboardActionCard";
import { PageTransition } from "@/shared/components/PageTransition";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { SearchControls } from "@/shared/components/SearchControls";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Dashboard - Main landing page after authentication
 */
const Dashboard = observer(() => {
	const { data: user, isLoading } = useCurrentUser();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const myProjectsStore = useMyProjectsStore();

	const [activeTab, setActiveTab] = useState<number>(() => {
		const tabParam = searchParams.get("tab");
		return tabParam ? parseInt(tabParam, 10) : 0;
	});

	const {
		data: adminTasks = [],
		isLoading: adminTasksLoading,
		isError: adminTasksError,
		error: adminTasksErrorObj,
		refetch: refetchAdminTasks,
	} = useAdminTasks();

	// Fetch endorsement tasks
	const {
		data: endorsementTasks,
		isLoading: endorsementTasksLoading,
		isError: endorsementTasksError,
		error: endorsementTasksErrorObj,
	} = useEndorsementTasks();

	// Fetch document tasks
	const {
		data: documentTasks,
		isLoading: documentTasksLoading,
		isError: documentTasksError,
		error: documentTasksErrorObj,
	} = useDocumentTasks();

	// Fetch my projects
	const {
		data: myProjects = [],
		isLoading: myProjectsLoading,
		isError: myProjectsError,
		error: myProjectsErrorObj,
	} = useMyProjects();

	// Filter projects using MobX store
	const filteredProjects = myProjectsStore.getFilteredProjects(myProjects);

	const firstName = user?.display_first_name || user?.first_name || user?.username || "User";

	// Check if user is a business area lead
	const isBusinessAreaLead = (user?.business_areas_led?.length ?? 0) > 0;
	const isSuperuser = user?.is_superuser === true;

	// Calculate task counts
	const documentTasksCount = 
		(documentTasks?.team?.length || 0) +
		(documentTasks?.lead?.length || 0) +
		(documentTasks?.ba?.length || 0) +
		(documentTasks?.directorate?.length || 0);
	
	const myTasksCount = documentTasksCount;
	const myProjectsCount = filteredProjects.length;
	const adminTasksCount = adminTasks.length;

	const handleProjectClick = (projectId: number, event: React.MouseEvent) => {
		const url = `/projects/${projectId}/overview`;
		
		if (event.ctrlKey || event.metaKey) {
			window.open(url, "_blank");
		} else {
			navigate(url);
		}
	};

	return (
		<PageTransition isLoading={isLoading}>
			{isLoading ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center space-y-4">
						<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
						<div className="text-lg font-medium text-muted-foreground">Loading dashboard...</div>
					</div>
				</div>
			) : (
		<div className="space-y-8 relative">
			{/* Welcome Section */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
					Welcome back, {firstName}!
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					The Science Project Management System (SPMS) is DBCA's portal for science project planning, approval and reporting.
				</p>
			</div>

			{/* Quick Actions Grid */}
			<div>
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<DashboardActionCard
						icon={<FaQuestionCircle className="w-5 h-5" />}
						title="Guide"
						description="Learn how to use the system"
						targetPath="/guide"
						colorScheme="blue"
						delay={0.1}
					/>

					<DashboardActionCard
						icon={<FaSearch className="w-5 h-5" />}
						title="Search Projects"
						description="Browse all science projects"
						targetPath="/projects"
						colorScheme="blue"
						delay={0.15}
					/>

					<DashboardActionCard
						icon={<MdFeedback className="w-5 h-5" />}
						title="Submit Feedback"
						description="ecoinformatics.admin@dbca.wa.gov.au"
						href="mailto:ecoinformatics.admin@dbca.wa.gov.au?subject=SPMS Feedback"
						colorScheme="purple"
						delay={0.2}
					/>

					<DashboardActionCard
						icon={<FaCirclePlus className="w-5 h-5" />}
						title="Create Project"
						description="Start a new science project"
						targetPath="/projects/create"
						colorScheme="green"
						delay={0.25}
					/>
				</div>
			</div>

			{/* External Resources */}
			<div>
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
					External Resources
				</h2>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
					Quick links to related DBCA systems
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<DashboardActionCard
						icon={<FaDatabase className="w-5 h-5" />}
						title="Data Catalogue"
						description="Access DBCA's data portal"
						href="https://data.bio.wa.gov.au/"
						colorScheme="blue"
						delay={0.3}
					/>

					<DashboardActionCard
						icon={<TbWorldWww className="w-5 h-5" />}
						title="Scientific Sites Register"
						description="Browse scientific sites"
						href="https://scientificsites.dpaw.wa.gov.au/"
						colorScheme="blue"
						delay={0.35}
					/>
				</div>
			</div>

			{/* Section Divider */}
			<div className="pt-6 mb-0">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					Your Work
				</h2>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Manage your tasks, documents, and projects
				</p>
			</div>

			{/* Tasks & Projects Tabs */}
			<div className="">
				{/* Tab Navigation */}
				<div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 relative">
					{/* Admin Tab (superuser only) - First tab */}
					{user?.is_superuser && (
						<button
							onClick={() => setActiveTab(0)}
							className={`relative flex-1 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base transition-all cursor-pointer ${
								activeTab === 0
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
							}`}
						>
							<div className="flex items-center justify-center gap-1 sm:gap-2">
								<span>Admin</span>
								{adminTasksCount > 0 && (
									<span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[22px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold text-white bg-red-600 rounded-full">
										{adminTasksCount}
									</span>
								)}
							</div>
						</button>
					)}

					{/* Documents Tab */}
					<button
						onClick={() => setActiveTab(user?.is_superuser ? 1 : 0)}
						className={`relative flex-1 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base transition-all cursor-pointer ${
							activeTab === (user?.is_superuser ? 1 : 0)
								? "text-blue-600 dark:text-blue-400"
								: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
						}`}
					>
						<div className="flex items-center justify-center gap-1 sm:gap-2">
							<span className="hidden sm:inline">Documents</span>
							<span className="sm:hidden">Docs</span>
							{myTasksCount > 0 && (
								<span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[22px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold text-white bg-blue-600 rounded-full">
									{myTasksCount}
								</span>
							)}
						</div>
					</button>

					{/* My Projects Tab */}
					<button
						onClick={() => setActiveTab(user?.is_superuser ? 2 : 1)}
						className={`relative flex-1 px-2 sm:px-4 md:px-6 py-3 md:py-4 font-semibold text-sm md:text-base transition-all cursor-pointer ${
							activeTab === (user?.is_superuser ? 2 : 1)
								? "text-blue-600 dark:text-blue-400"
								: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
						}`}
					>
						<div className="flex items-center justify-center gap-1 sm:gap-2">
							<span className="hidden sm:inline">My Projects</span>
							<span className="sm:hidden">Projects</span>
							{myProjectsCount > 0 && (
								<span className="inline-flex items-center justify-center min-w-[20px] sm:min-w-[22px] h-5 sm:h-6 px-1.5 sm:px-2 text-xs font-bold text-white bg-blue-600 rounded-full">
									{myProjectsCount}
								</span>
							)}
						</div>
					</button>

					{/* Active tab indicator - positioned absolutely at bottom of tab bar */}
					<motion.div
						layoutId="activeTab"
						className="absolute bottom-0 h-0.5 bg-blue-600 dark:bg-blue-400"
						style={{
							left: user?.is_superuser 
								? `${(activeTab / 3) * 100}%`
								: `${(activeTab / 2) * 100}%`,
							width: user?.is_superuser ? '33.333%' : '50%',
						}}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
					/>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">
					{/* Admin Panel - First panel for superusers */}
					{activeTab === 0 && user?.is_superuser && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							<MyTasksSection
								adminTasks={adminTasks}
								adminTasksLoading={adminTasksLoading}
								adminTasksError={adminTasksError ? adminTasksErrorObj : null}
								refetchAdminTasks={refetchAdminTasks}
								endorsementTasks={endorsementTasks}
								endorsementTasksLoading={endorsementTasksLoading}
								endorsementTasksError={endorsementTasksError ? endorsementTasksErrorObj : null}
							/>
						</motion.div>
					)}

					{/* Documents Panel */}
					{activeTab === (user?.is_superuser ? 1 : 0) && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							<DocumentTasksTabContent
								documentTasks={documentTasks}
								documentTasksLoading={documentTasksLoading}
								documentTasksError={documentTasksError ? documentTasksErrorObj : null}
								isBusinessAreaLead={isBusinessAreaLead}
								isSuperuser={isSuperuser}
							/>
						</motion.div>
					)}

					{/* My Projects Panel */}
					{activeTab === (user?.is_superuser ? 2 : 1) && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="space-y-4"
						>
							{/* Filter Controls */}
							<div className="space-y-3">
								{/* Search input - matches ProjectFilters style */}
								<div className="relative w-full">
									<Input
										type="text"
										placeholder="Search projects by name, keyword, or tag..."
										value={myProjectsStore.state.searchTerm}
										onChange={(e) => myProjectsStore.setSearchTerm(e.target.value)}
										variant="search"
										className="pl-10 text-sm rounded-md"
									/>
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-600 dark:text-blue-400" />
								</div>
								
								{/* Bottom row: Hide Inactive checkbox and Search Controls */}
								<div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
									{/* Left side: Hide Inactive checkbox */}
									<div className="flex items-center space-x-2">
										<Checkbox
											id="hideInactive"
											checked={myProjectsStore.state.filters.hideInactive}
											onCheckedChange={(checked) => 
												myProjectsStore.setHideInactive(checked as boolean)
											}
										/>
										<Label 
											htmlFor="hideInactive"
											className="text-sm font-normal cursor-pointer whitespace-nowrap"
										>
											Hide Inactive
										</Label>
									</div>
									
									{/* Right side: Remember my search and Clear button */}
									<div className="flex justify-center">
										<SearchControls
											saveSearch={myProjectsStore.state.saveSearch}
											onToggleSaveSearch={() => myProjectsStore.toggleSaveSearch()}
											filterCount={myProjectsStore.filterCount}
											onClearFilters={() => myProjectsStore.resetFilters()}
											className="flex gap-3 items-center"
										/>
									</div>
								</div>
							</div>

							{/* Projects Table */}
							{myProjectsLoading ? (
								<div className="flex items-center justify-center min-h-[200px]">
									<Loader2 className="size-8 animate-spin text-blue-600" />
								</div>
							) : myProjectsError ? (
								<Alert variant="destructive">
									<AlertCircle className="size-4" />
									<AlertDescription>
										Failed to load projects: {myProjectsErrorObj?.message || "Unknown error"}
									</AlertDescription>
								</Alert>
							) : (
								<ProjectsDataTable
									projects={filteredProjects}
									columns={{
										title: true,
										image: true,
										kind: false,
										status: true,
										businessArea: false,
										role: true,
										createdAt: false,
									}}
									defaultSort="title"
									emptyMessage={
										myProjectsStore.state.filters.hideInactive
											? "You aren't associated with any active projects"
											: "You aren't associated with any projects"
									}
									onProjectClick={handleProjectClick}
								/>
							)}
						</motion.div>
					)}
				</div>
			</div>
		</div>
			)}
		</PageTransition>
	);
});

export default Dashboard;
