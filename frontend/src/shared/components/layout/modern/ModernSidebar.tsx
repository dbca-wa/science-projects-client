import { NavLink } from "react-router";
import { observer } from "mobx-react-lite";
import { FaHome, FaBook, FaQuestionCircle } from "react-icons/fa";
import { cn } from "@/shared/lib/utils";

/**
 * ModernSidebar - Simplified sidebar for baseline
 * - Dashboard link
 * - Quick Guide link
 * - How To link
 * - Maintains responsive behavior
 */
const ModernSidebar = observer(() => {
	const navItems = [
		{
			name: "Dashboard",
			path: "/",
			icon: FaHome,
		},
		{
			name: "Quick Guide",
			path: "/guide",
			icon: FaBook,
		},
		{
			name: "How To",
			path: "/howto",
			icon: FaQuestionCircle,
		},
	];

	return (
		<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
			<nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
				{navItems.map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						end={item.path === "/"}
						className={({ isActive }) =>
							cn(
								"flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
								isActive
									? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
									: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
							)
						}
					>
						<item.icon className="w-5 h-5" />
						<span>{item.name}</span>
					</NavLink>
				))}
			</nav>

			{/* Footer info */}
			<div className="p-4 border-t border-gray-200 dark:border-gray-800">
				<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
					Science Projects Management System
				</p>
			</div>
		</aside>
	);
});

ModernSidebar.displayName = "ModernSidebar";

export default ModernSidebar;
