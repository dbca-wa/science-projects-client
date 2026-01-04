import { Outlet, Link, useLocation } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "@/app/stores/root.store";
import { getSidebarRoutes } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

const AppLayout = observer(() => {
	const { authStore, uiStore } = useStore();
	const location = useLocation();
	const sidebarRoutes = getSidebarRoutes();

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
				<div className="mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-xl font-bold text-gray-900 dark:text-white">
							Reaction Clicker
						</h1>
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => uiStore.toggleTheme()}
							>
								{uiStore.theme === "light" ? "🌙" : "☀️"}
							</Button>
							{authStore.isAuthenticated ? (
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-600 dark:text-gray-300">
										{authStore.user?.username || "Guest"}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => authStore.logout()}
									>
										Logout
									</Button>
								</div>
							) : (
								<Link to="/login">
									<Button variant="outline" size="sm">
										Login
									</Button>
								</Link>
							)}
						</div>
					</div>
				</div>
			</header>
			<div className="flex">
				<aside className="w-64 bg-white dark:bg-gray-800 min-h-[calc(100vh-4rem)] border-r border-gray-200 dark:border-gray-700">
					<nav className="p-4 space-y-2">
						{sidebarRoutes.map((route) => {
							const isActive = location.pathname === route.path;
							const requiresAuth = route.requiresAuth;
							const canAccess =
								!requiresAuth || authStore.isAuthenticated;

							if (!canAccess) return null;

							return (
								<Link
									key={route.path}
									to={route.path}
									className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
										isActive
											? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
											: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									}`}
								>
									<span className="text-lg">
										{route.icon}
									</span>
									<span className="font-medium">
										{route.name}
									</span>
								</Link>
							);
						})}
					</nav>
				</aside>
				<main className="flex-1 p-8">
					<Outlet />
				</main>
			</div>
		</div>
	);
});

export default AppLayout;
