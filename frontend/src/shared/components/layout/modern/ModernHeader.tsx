import { useCurrentUser, useLogout } from "@/features/auth/hooks/useAuth";
import { observer } from "mobx-react-lite";
import { Button } from "@/shared/components/ui/button";
import { ToggleDarkMode } from "../ToggleDarkMode";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

/**
 * ModernHeader - Header component for the modern layout
 * - Displays current user's name
 * - Logout button using useLogout hook
 * - Theme toggle functionality
 * - Shows loading state during logout
 */
const ModernHeader = observer(() => {
	const { data: user } = useCurrentUser();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

	const displayName =
		user?.display_first_name || user?.username || "User";

	const handleLogout = () => {
		logout();
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
			<div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* Left side - Logo/Brand */}
				<div className="flex items-center space-x-4">
					<h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
						Science Projects
					</h1>
				</div>

				{/* Right side - User info, theme toggle, logout */}
				<div className="flex items-center space-x-4">
					{/* User info */}
					<div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
						<FaUser className="w-4 h-4" />
						<span>{displayName}</span>
					</div>

					{/* Theme toggle */}
					<ToggleDarkMode />

					{/* Logout button */}
					<Button
						variant="outline"
						size="sm"
						onClick={handleLogout}
						disabled={isLoggingOut}
						className="flex items-center space-x-2"
					>
						<FaSignOutAlt className="w-4 h-4" />
						<span className="hidden sm:inline">
							{isLoggingOut ? "Logging out..." : "Logout"}
						</span>
					</Button>
				</div>
			</div>
		</header>
	);
});

ModernHeader.displayName = "ModernHeader";

export default ModernHeader;
