import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import { FaQuestionCircle, FaDatabase, FaSearch } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { MdFeedback } from "react-icons/md";
import { useNavigate } from "react-router";
import { DashboardActionCard } from "@/shared/components/DashboardActionCard";

/**
 * Dashboard - Main landing page after authentication
 */
const Dashboard = observer(() => {
	const { data: user, isLoading } = useCurrentUser();
	const navigate = useNavigate();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	const displayName = user?.display_first_name || user?.username || "User";
	const fullName = user?.display_first_name && user?.display_last_name
		? `${user.display_first_name} ${user.display_last_name}`
		: displayName;

	return (
		<div className="space-y-8 relative">
			{/* Welcome Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
					Welcome back, {displayName}!
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
					Hello {fullName}! Welcome to SPMS, DBCA's portal for science project planning, approval and reporting.
				</p>
			</motion.div>

			{/* Quick Actions Grid */}
			<div>
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Mobile (1 col): Create Project first */}
					<DashboardActionCard
						icon={<FaCirclePlus className="w-5 h-5" />}
						title="Create Project"
						description="Start a new science project"
						onClick={() => navigate("/projects/create")}
						colorScheme="green"
						delay={0.1}
					/>

					{/* Mobile: Search Projects second, Desktop (3 col): top right */}
					<DashboardActionCard
						icon={<FaSearch className="w-5 h-5" />}
						title="Search Projects"
						description="Browse all science projects"
						onClick={() => navigate("/projects")}
						colorScheme="blue"
						delay={0.15}
					/>

					{/* Mobile: Quick Guide third */}
					<DashboardActionCard
						icon={<FaQuestionCircle className="w-5 h-5" />}
						title="Quick Guide"
						description="Learn how to use the system"
						onClick={() => navigate("/guide")}
						colorScheme="blue"
						delay={0.2}
					/>

					{/* Mobile: Submit Feedback fourth */}
					<DashboardActionCard
						icon={<MdFeedback className="w-5 h-5" />}
						title="Submit Feedback"
						description="Help us improve SPMS"
						href="mailto:ecoinformatics.admin@dbca.wa.gov.au?subject=SPMS Feedback"
						colorScheme="purple"
						delay={0.25}
					/>

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

			{/* Version Number */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="flex justify-end"
			>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Version {import.meta.env.VITE_SPMS_VERSION || "Development v3"}
				</p>
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
					</div>
				</motion.div>
			)}
		</div>
	);
});

export default Dashboard;
