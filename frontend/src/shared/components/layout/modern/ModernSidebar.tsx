import { ROUTE_ICONS } from "@/app/router/route-icons";
import { getSidebarRoutes } from "@/app/router/routes.config";
import { cn } from "@/shared/lib/utils";
import { NavLink } from "react-router";

/**
 * ModernSidebar - Simplified sidebar for baseline
 * - Dynamically renders routes from routes.config.ts
 * - Groups routes by section
 * - Maintains responsive behavior
 */
const ModernSidebar = () => {
	const sidebarRoutes = getSidebarRoutes();

	// Group routes by section
	const routesBySection = sidebarRoutes.reduce((acc, route) => {
		const section = route.section || "Main";
		if (!acc[section]) {
			acc[section] = [];
		}
		acc[section].push(route);
		return acc;
	}, {} as Record<string, typeof sidebarRoutes>);

	return (
		<aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-30">
			<nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
				{Object.entries(routesBySection).map(([section, routes]) => (
					<div key={section}>
						{section !== "Main" && (
							<h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
								{section}
							</h3>
						)}
						<div className="space-y-1">
							{routes.map((route) => {
								const Icon = route.iconKey ? ROUTE_ICONS[route.iconKey as keyof typeof ROUTE_ICONS] : null;
								
								return (
									<NavLink
										key={route.path}
										to={route.path}
										end={route.path === "/"}
										className={({ isActive }) =>
											cn(
												"flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
												isActive
													? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
													: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
											)
										}
									>
										{Icon && <span className="w-5 h-5 flex items-center justify-center">{Icon}</span>}
										<span>{route.name}</span>
									</NavLink>
								);
							})}
						</div>
					</div>
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
};

ModernSidebar.displayName = "ModernSidebar";

export default ModernSidebar;
