import { ROUTE_ICONS } from "@/app/router/route-icons";
import { getSidebarRoutes } from "@/app/router/routes.config";
import { useAuthStore } from "@/app/stores/store-context";
import { cn } from "@/shared/lib/utils";
import { NavLink, useLocation } from "react-router";
import { observer } from "mobx-react-lite";

/**
 * ModernSidebar - Simplified sidebar for baseline
 * - Dynamically renders routes from routes.config.ts
 * - Groups routes by section
 * - Filters admin-only routes based on user permissions
 * - Maintains responsive behavior
 */
const ModernSidebar = observer(() => {
	const authStore = useAuthStore();
	const location = useLocation();
	const allSidebarRoutes = getSidebarRoutes();
	
	// Filter routes based on user permissions
	const sidebarRoutes = allSidebarRoutes.filter(route => {
		// If route requires admin, only show to admins
		if (route.requiresAdmin) {
			return authStore.isSuperuser;
		}
		return true;
	});

	// Custom function to determine if a route should be highlighted
	const isRouteActive = (routePath: string): boolean => {
		const currentPath = location.pathname;
		
		// Exact match only - no parent/child highlighting
		return currentPath === routePath;
	};

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
								const isActive = isRouteActive(route.path);
								
								return (
									<NavLink
										key={route.path}
										to={route.path}
										className={() =>
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
				<div 
					className="text-xs text-gray-500 dark:text-gray-400 text-center cursor-pointer"
					onClick={() => console.log(import.meta.env.VITE_SPMS_VERSION || "3.0.0")}
				>
					<a
						href="https://github.com/dbca-wa/science-projects-client"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
					>
						SPMS {import.meta.env.VITE_SPMS_VERSION || "3.0.0"}
					</a>
				</div>
			</div>
		</aside>
	);
});

ModernSidebar.displayName = "ModernSidebar";

export default ModernSidebar;
