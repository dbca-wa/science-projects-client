import { Children, useState, useEffect, useRef } from "react";
import { useCurrentUser } from "@/features/auth";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import {
	useAdminTasks,
	useEndorsementTasks,
	useDocumentTasks,
	MyTasksSection,
	DocumentTasksTabContent,
} from "@/features/dashboard";
import { CaretakerSection, CaretakerNotification } from "@/features/caretakers";
import { CaretakerApprovalModal } from "@/features/caretakers/components/CaretakerApprovalModal";
import { useMyProjects } from "@/features/projects/hooks/useMyProjects";
import { ProjectsDataTable } from "@/shared/components/projects/ProjectsDataTable";
import { useMyProjectsStore } from "@/app/stores/store-context";
import { observer } from "mobx-react-lite";
import { FaQuestionCircle, FaDatabase, FaSearch } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { MdFeedback } from "react-icons/md";
import { useSearchParams, useNavigate } from "react-router";
import { DashboardActionCard } from "@/features/dashboard/components/DashboardActionCard";
import { PageTransition } from "@/shared/components/PageTransition";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
import { SearchControls } from "@/shared/components/SearchControls";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { useHomepageBanner } from "@/features/admin/hooks/useHomepageBanner";
import { HomepageBanner } from "@/features/admin/components/shared/HomepageBanner";

const TAB_ADMIN = "admin";
const TAB_DOCUMENTS = "documents";
const TAB_PROJECTS = "projects";

/** Grid that goes full-width for a single child, 2-col for multiple */
const ActionCardGrid = ({ children }: { children: React.ReactNode }) => {
	const count = Children.count(children);
	return (
		<div
			className={`grid gap-4 ${count <= 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
		>
			{children}
		</div>
	);
};

/**
 * Dashboard — Main landing page after authentication
 */
const Dashboard = observer(() => {
	useDocumentTitle("Dashboard");
	const { data: user, isLoading } = useCurrentUser();
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const myProjectsStore = useMyProjectsStore();

	// Modal state — controlled by URL
	const selectedTaskId = searchParams.get("caretaker_task");
	const isModalOpen = !!selectedTaskId;

	// Delay modal opening until after page transition completes
	const [shouldShowModal, setShouldShowModal] = useState(false);
	const wasLoadingRef = useRef(false);

	useEffect(() => {
		if (isLoading && isModalOpen) {
			wasLoadingRef.current = true;
		}
	}, [isLoading, isModalOpen]);

	useEffect(() => {
		if (isModalOpen && !isLoading) {
			const delay = wasLoadingRef.current ? 600 : 0;
			const timer = setTimeout(() => {
				setShouldShowModal(true);
				wasLoadingRef.current = false;
			}, delay);
			return () => clearTimeout(timer);
		} else if (!isModalOpen) {
			setShouldShowModal(false);
		}
	}, [isModalOpen, isLoading]);

	const isSuperuser = user?.is_superuser === true;

	// Derive active tab from URL search params
	const tabParam = searchParams.get("tab");
	const defaultTab = isSuperuser ? TAB_ADMIN : TAB_DOCUMENTS;
	const activeTab = tabParam || defaultTab;

	const handleTabChange = (value: string) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set("tab", value);
				return next;
			},
			{ replace: true }
		);
	};

	const {
		data: adminTasks = [],
		isLoading: adminTasksLoading,
		isError: adminTasksError,
		error: adminTasksErrorObj,
		refetch: refetchAdminTasks,
	} = useAdminTasks();

	const { data: bannerData } = useHomepageBanner();

	const {
		data: endorsementTasks,
		isLoading: endorsementTasksLoading,
		isError: endorsementTasksError,
		error: endorsementTasksErrorObj,
	} = useEndorsementTasks();

	const {
		data: documentTasks,
		isLoading: documentTasksLoading,
		isError: documentTasksError,
		error: documentTasksErrorObj,
	} = useDocumentTasks();

	const {
		data: myProjects = [],
		isLoading: myProjectsLoading,
		isError: myProjectsError,
		error: myProjectsErrorObj,
	} = useMyProjects();

	const filteredProjects = myProjectsStore.getFilteredProjects(myProjects);

	const firstName =
		user?.display_first_name || user?.first_name || user?.username || "User";

	const isBusinessAreaLead = (user?.business_areas_led?.length ?? 0) > 0;

	// Calculate task counts
	const documentTasksCount =
		(documentTasks?.team?.length || 0) +
		(documentTasks?.lead?.length || 0) +
		(documentTasks?.ba?.length || 0) +
		(documentTasks?.directorate?.length || 0);

	const myTasksCount = documentTasksCount;
	const myProjectsCount = filteredProjects.length;

	const caretakerTasksCount = adminTasks.filter(
		(task) => task.action === "setcaretaker"
	).length;
	const projectDeletionTasksCount = adminTasks.filter(
		(task) => task.action === "deleteproject"
	).length;
	const mergeUserTasksCount = adminTasks.filter(
		(task) => task.action === "mergeuser"
	).length;
	const endorsementTasksCount =
		(endorsementTasks?.aec?.length || 0) +
		(endorsementTasks?.bm?.length || 0) +
		(endorsementTasks?.hc?.length || 0);
	const adminTasksCount =
		caretakerTasksCount +
		projectDeletionTasksCount +
		mergeUserTasksCount +
		endorsementTasksCount;

	const handleProjectClick = (projectId: number, event: React.MouseEvent) => {
		const url = `/projects/${projectId}/overview`;

		if (event.ctrlKey || event.metaKey) {
			window.open(url, "_blank");
		} else {
			navigate(url);
		}
	};

	const handleCloseSheet = () => {
		setSearchParams({}, { replace: true });
	};

	return (
		<>
			<PageTransition isLoading={isLoading}>
				{isLoading ? (
					<div className="flex items-center justify-center min-h-[400px]">
						<div className="text-center space-y-4">
							<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
							<div className="text-lg font-medium text-muted-foreground">
								Loading dashboard...
							</div>
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
								The Science Project Management System (SPMS) is DBCA's portal
								for science project planning, approval and reporting.
							</p>
						</div>

						{/* Homepage Banner */}
						{bannerData?.show_homepage_message &&
							bannerData?.homepage_message && (
								<HomepageBanner message={bannerData.homepage_message} />
							)}

						{/* Quick Actions Grid */}
						<div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
								Quick Actions
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<DashboardActionCard
									icon={<FaQuestionCircle className="w-5 h-5" />}
									title="Knowledge Base"
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
							<ActionCardGrid>
								<DashboardActionCard
									icon={<FaDatabase className="w-5 h-5" />}
									title="Data Catalogue"
									description="Access DBCA's data portal"
									href="https://data.bio.wa.gov.au/"
									colorScheme="blue"
									delay={0.3}
								/>
							</ActionCardGrid>
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

						{/* Caretaker Notification */}
						{user && user.caretakers && user.caretakers.length > 0 && (
							<CaretakerNotification caretakers={user.caretakers} />
						)}

						{/* Tasks & Projects Tabs */}
						<Tabs
							value={activeTab}
							onValueChange={handleTabChange}
							className="w-full mt-2"
						>
							<TabsList className="w-full flex">
								{isSuperuser && (
									<TabsTrigger value={TAB_ADMIN} className="flex-1">
										<span>Admin</span>
										{adminTasksCount > 0 && (
											<span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-600 rounded-full">
												{adminTasksCount}
											</span>
										)}
									</TabsTrigger>
								)}
								<TabsTrigger value={TAB_DOCUMENTS} className="flex-1">
									<span className="hidden sm:inline">Documents</span>
									<span className="sm:hidden">Docs</span>
									{myTasksCount > 0 && (
										<span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full">
											{myTasksCount}
										</span>
									)}
								</TabsTrigger>
								<TabsTrigger value={TAB_PROJECTS} className="flex-1">
									<span className="hidden sm:inline">My Projects</span>
									<span className="sm:hidden">Projects</span>
									{myProjectsCount > 0 && (
										<span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full">
											{myProjectsCount}
										</span>
									)}
								</TabsTrigger>
							</TabsList>

							{/* Admin Panel */}
							{isSuperuser && (
								<TabsContent value={TAB_ADMIN}>
									<MyTasksSection
										adminTasks={adminTasks}
										adminTasksLoading={adminTasksLoading}
										adminTasksError={
											adminTasksError ? adminTasksErrorObj : null
										}
										refetchAdminTasks={refetchAdminTasks}
										endorsementTasks={endorsementTasks}
										endorsementTasksLoading={endorsementTasksLoading}
										endorsementTasksError={
											endorsementTasksError ? endorsementTasksErrorObj : null
										}
									/>
								</TabsContent>
							)}

							{/* Documents Panel */}
							<TabsContent value={TAB_DOCUMENTS}>
								<DocumentTasksTabContent
									documentTasks={documentTasks}
									documentTasksLoading={documentTasksLoading}
									documentTasksError={
										documentTasksError ? documentTasksErrorObj : null
									}
									isBusinessAreaLead={isBusinessAreaLead}
								/>
							</TabsContent>

							{/* My Projects Panel */}
							<TabsContent value={TAB_PROJECTS}>
								<div className="space-y-4">
									{/* Filter Controls */}
									<div className="space-y-3">
										<div className="relative w-full">
											<Input
												type="text"
												placeholder="Search projects by name, keyword, or tag..."
												value={myProjectsStore.state.searchTerm}
												onChange={(e) =>
													myProjectsStore.setSearchTerm(e.target.value)
												}
												variant="search"
												className="pl-10 text-sm rounded-md"
											/>
											<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-blue-600 dark:text-blue-400" />
										</div>

										<div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
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

											<div className="flex justify-center">
												<SearchControls
													saveSearch={myProjectsStore.state.saveSearch}
													onToggleSaveSearch={() =>
														myProjectsStore.toggleSaveSearch()
													}
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
												Failed to load projects:{" "}
												{myProjectsErrorObj?.message || "Unknown error"}
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
								</div>
							</TabsContent>
						</Tabs>

						{/* Caretaker Section */}
						{user && (
							<CaretakerSection
								userId={user.id}
								caretakees={user.caretaking_for || []}
							/>
						)}
					</div>
				)}
			</PageTransition>

			{/* Caretaker Approval Modal */}
			<CaretakerApprovalModal
				taskId={selectedTaskId ? Number(selectedTaskId) : null}
				open={shouldShowModal}
				onClose={handleCloseSheet}
			/>
		</>
	);
});

export default Dashboard;
