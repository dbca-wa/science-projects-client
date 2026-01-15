import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { observer } from "mobx-react-lite";
import { motion } from "framer-motion";
import { FaBook, FaQuestionCircle } from "react-icons/fa";
import { Link } from "react-router";

/**
 * Dashboard - Main landing page after authentication
 * - Displays welcome message with user's name
 * - Shows quick links to main features
 * - Uses useCurrentUser hook to fetch user data
 * - Displays loading state while fetching
 */
const Dashboard = observer(() => {
	const { data: user, isLoading } = useCurrentUser();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	const displayName = user?.display_first_name || user?.username || "User";

	return (
		<div className="space-y-8">
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
					Here's what you can do today
				</p>
			</motion.div>

			{/* Quick Links Section */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
					Quick Links
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{/* Quick Guide Link */}
					<Link
						to="/guide"
						className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
					>
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
								<FaBook className="w-5 h-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 dark:text-gray-100">
									Quick Guide
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Learn how to use the system
								</p>
							</div>
						</div>
					</Link>

					{/* How To Link */}
					<Link
						to="/howto"
						className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
					>
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
								<FaQuestionCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900 dark:text-gray-100">
									How To
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Step-by-step instructions
								</p>
							</div>
						</div>
					</Link>

					{/* Placeholder for future features */}
					<div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
						<div className="flex items-center space-x-3">
							<div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
								<div className="w-5 h-5 bg-gray-400 dark:bg-gray-600 rounded"></div>
							</div>
							<div>
								<h3 className="font-semibold text-gray-500 dark:text-gray-400">
									More Coming Soon
								</h3>
								<p className="text-sm text-gray-400 dark:text-gray-500">
									Additional features will appear here
								</p>
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			{/* User Info Section (for development) */}
			{import.meta.env.MODE === "development" && user && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
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
