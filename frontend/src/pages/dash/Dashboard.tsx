import { useState, useEffect } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import { FaQuestionCircle, FaDatabase, FaSearch } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { MdFeedback } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router";
import { DashboardActionCard } from "@/shared/components/DashboardActionCard";
import { useAdminTasks } from "@/features/dashboard/hooks/useDashboardTasks";
import { MyTasksSection } from "@/features/dashboard/components/MyTasksSection";

/**
 * Dashboard - Main landing page after authentication
 */
const Dashboard = observer(() => {
	const { data: user, isLoading } = useCurrentUser();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

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

	useEffect(() => {
		setSearchParams({ tab: activeTab.toString() });
	}, [activeTab, setSearchParams]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	const firstName = user?.display_first_name || user?.first_name || user?.username || "User";

	// Check if user is a business area lead
	const isBusinessAreaLead = (user?.business_areas_led?.length ?? 0) > 0;

	const myTasksCount = 0; // TODO: Calculate when document/endorsement tasks are added
	const myProjectsCount = 0; // TODO: Calculate when projects feature is added
	const adminTasksCount = adminTasks.length;

	return (
		<div className="space-y-8 relative">
			{/* Welcome Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
					Welcome back, {firstName}!
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					The Science Project Management System (SPMS) is DBCA's portal for science project planning, approval and reporting.
				</p>
			</motion.div>

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
						onClick={() => navigate("/guide")}
						colorScheme="blue"
						delay={0.1}
					/>

					<DashboardActionCard
						icon={<FaSearch className="w-5 h-5" />}
						title="Search Projects"
						description="Browse all science projects"
						onClick={() => navigate("/projects")}
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
						onClick={() => navigate("/projects/create")}
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
						onClick={() => window.open("https://data.bio.wa.gov.au/", "_blank")}
						colorScheme="blue"
						delay={0.3}
					/>

					<DashboardActionCard
						icon={<TbWorldWww className="w-5 h-5" />}
						title="Scientific Sites Register"
						description="Browse scientific sites"
						onClick={() => window.open("https://scientificsites.dpaw.wa.gov.au/", "_blank")}
						colorScheme="blue"
						delay={0.35}
					/>
				</div>
			</div>

			{/* Section Divider */}
			<div className="relative py-8">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t-2 border-gray-300 dark:border-gray-600" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-white dark:bg-gray-900 px-6 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
						Tasks & Projects
					</span>
				</div>
			</div>

			{/* Tasks & Projects Tabs */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
			>
				{/* Tab Navigation */}
				<div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
					{/* Admin Tasks Tab (superuser only) - First tab */}
					{user?.is_superuser && (
						<button
							onClick={() => setActiveTab(0)}
							className={`relative flex-1 px-6 py-4 font-semibold text-base transition-all cursor-pointer ${
								activeTab === 0
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
							}`}
						>
							<div className="flex items-center justify-center gap-2">
								<span>Admin Tasks</span>
								{adminTasksCount > 0 && (
									<span className="inline-flex items-center justify-center min-w-[22px] h-6 px-2 text-xs font-bold text-white bg-red-600 rounded-full">
										{adminTasksCount}
									</span>
								)}
							</div>
							{activeTab === 0 && (
								<motion.div
									layoutId="activeTab"
									className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
									transition={{ type: "spring", stiffness: 500, damping: 30 }}
								/>
							)}
						</button>
					)}

					{/* My Tasks Tab */}
					<button
						onClick={() => setActiveTab(user?.is_superuser ? 1 : 0)}
						className={`relative flex-1 px-6 py-4 font-semibold text-base transition-all cursor-pointer ${
							activeTab === (user?.is_superuser ? 1 : 0)
								? "text-blue-600 dark:text-blue-400"
								: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
						}`}
					>
						<div className="flex items-center justify-center gap-2">
							<span>My Tasks</span>
							{myTasksCount > 0 && (
								<span className="inline-flex items-center justify-center min-w-[22px] h-6 px-2 text-xs font-bold text-white bg-blue-600 rounded-full">
									{myTasksCount}
								</span>
							)}
						</div>
						{activeTab === (user?.is_superuser ? 1 : 0) && (
							<motion.div
								layoutId="activeTab"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
								transition={{ type: "spring", stiffness: 500, damping: 30 }}
							/>
						)}
					</button>

					{/* My Projects Tab */}
					<button
						onClick={() => setActiveTab(user?.is_superuser ? 2 : 1)}
						className={`relative flex-1 px-6 py-4 font-semibold text-base transition-all cursor-pointer ${
							activeTab === (user?.is_superuser ? 2 : 1)
								? "text-blue-600 dark:text-blue-400"
								: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
						}`}
					>
						<div className="flex items-center justify-center gap-2">
							<span>My Projects</span>
							{myProjectsCount > 0 && (
								<span className="inline-flex items-center justify-center min-w-[22px] h-6 px-2 text-xs font-bold text-white bg-blue-600 rounded-full">
									{myProjectsCount}
								</span>
							)}
						</div>
						{activeTab === (user?.is_superuser ? 2 : 1) && (
							<motion.div
								layoutId="activeTab"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
								transition={{ type: "spring", stiffness: 500, damping: 30 }}
							/>
						)}
					</button>
				</div>

				{/* Tab Content */}
				<div className="min-h-[400px]">
					{/* Admin Tasks Panel - First panel for superusers */}
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
							/>
						</motion.div>
					)}

					{/* My Tasks Panel */}
					{activeTab === (user?.is_superuser ? 1 : 0) && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="space-y-6"
						>
							{/* Document & Endorsement Tasks */}
							<div className="p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
								<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
									Document & Endorsement Tasks
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Will be available after Projects feature is implemented.
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
									This section will include: Concept Plans, Project Plans, Progress Reports, Student Reports, Project Closures, and Endorsements (AEC, Biometrician, Herbarium Curator).
								</p>
							</div>

							{/* Business Area Lead Tasks (only for BA leads) */}
							{isBusinessAreaLead && (
								<>
									{/* Divider */}
									<div className="relative py-6">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-gray-300 dark:border-gray-600" />
										</div>
										<div className="relative flex justify-center">
											<span className="bg-white dark:bg-gray-900 px-4 text-md font-semibold text-gray-700 dark:text-gray-300">
												Business Area Lead Tasks
											</span>
										</div>
									</div>

									{/* BA Lead Tasks Placeholder */}
									<div className="p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
										<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
											Business Area Lead Tasks
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Will be available after Projects feature is implemented.
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
											This section will show documents pending approval from members of business areas you lead.
										</p>
									</div>
								</>
							)}
						</motion.div>
					)}

					{/* My Projects Panel */}
					{activeTab === (user?.is_superuser ? 2 : 1) && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
						>
							<div className="p-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
								<h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
									My Projects
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Will be available after Projects feature is implemented.
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
									This section will show all projects where you are a team member or lead.
								</p>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>

			{/* User Info Section (for development) */}
			{import.meta.env.MODE === "development" && user && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.45 }}
					className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
				>
					<h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
						Development Info
					</h3>
					<div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
						<p>Username: {user.username}</p>
						<p>Email: {user.email}</p>
						<p>
							Role:{" "}
							{user.is_superuser
								? "Superuser"
								: user.is_staff
									? "Staff"
									: "User"}
						</p>
						{isBusinessAreaLead && (
							<p>Business Area Lead: Yes ({user.business_areas_led?.length} area{user.business_areas_led?.length !== 1 ? 's' : ''})</p>
						)}
					</div>
				</motion.div>
			)}
		</div>
	);
});

export default Dashboard;
