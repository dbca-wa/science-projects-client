import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore, useUIStore } from "@/app/stores/store-context";
import { useLogout } from "@/features/auth/hooks/useAuth";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { User, LogOut, Moon, Sun, BookOpen } from "lucide-react";
import { getUserDisplayName, getUserInitials } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import { useMenuKeyboardNavigation } from "@/shared/hooks/useMenuKeyboardNavigation";

interface NavitarContentProps {
	onClose: () => void;
}

/**
 * NavitarContent - The content inside the Navitar popover
 * Captures MobX state on mount to prevent flickering during close animation
 * Implements WCAG 2.2 keyboard navigation with arrow keys and focus management
 */
export default function NavitarContent({ onClose }: NavitarContentProps) {
	const navigate = useNavigate();
	const authStore = useAuthStore();
	const uiStore = useUIStore();
	const { mutate: logout } = useLogout();
	const { handleKeyDown, registerMenuItem, focusFirstItem } =
		useMenuKeyboardNavigation(onClose);

	// Capture store values once on mount using useState with initializer function
	const [snapshot] = useState(() => ({
		userData: authStore.user,
		theme: uiStore.theme,
	}));

	const avatarSrc = getImageUrl(snapshot.userData?.image);
	const displayName = getUserDisplayName(snapshot.userData);
	const initials = getUserInitials(snapshot.userData);

	// Focus first menu item when component mounts
	useEffect(() => {
		focusFirstItem();
	}, [focusFirstItem]);

	return (
		<div className="flex flex-col" onKeyDown={handleKeyDown}>
			{/* User Info Section */}
			<div className="p-4">
				<div className="flex gap-3 items-center">
					<Avatar className="h-12 w-12">
						<AvatarImage src={avatarSrc} alt={displayName} />
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col overflow-hidden">
						<h4 className="text-lg font-bold truncate">{displayName}</h4>
						<span className="text-xs text-gray-500 dark:text-gray-400 truncate">
							{snapshot.userData?.email}
						</span>
					</div>
				</div>
			</div>

			<Separator />

			{/* DBCA Account Section */}
			<div className="py-1">
				<div className="px-4 py-2">
					<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
						DBCA Account
					</span>
				</div>

				{/* My SPMS Profile */}
				<button
					ref={registerMenuItem(0)}
					type="button"
					onClick={() => {
						navigate("/users/me");
						onClose();
					}}
					className="w-full text-left cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded"
					role="menuitem"
				>
					<div className="flex gap-2 items-center">
						<User className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm">My SPMS Profile</span>
					</div>
				</button>
			</div>

			<Separator />

			{/* Appearance Section */}
			<div className="py-1">
				<div className="px-4 py-2">
					<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
						Appearance
					</span>
				</div>

				{/* Toggle Dark Mode */}
				<button
					ref={registerMenuItem(1)}
					type="button"
					onClick={() => {
						uiStore.toggleTheme();
						onClose();
					}}
					className="w-full text-left cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded"
					role="menuitem"
				>
					<div className="flex gap-2 items-center">
						{snapshot.theme === "dark" ? (
							<Sun className="h-4 w-4" aria-hidden="true" />
						) : (
							<Moon className="h-4 w-4" aria-hidden="true" />
						)}
						<span className="text-sm">Toggle Dark Mode</span>
					</div>
				</button>
			</div>

			<Separator />

			{/* Links Section */}
			<div className="py-1">
				<div className="px-4 py-2">
					<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
						Links
					</span>
				</div>

				{/* Quick Guide */}
				<button
					ref={registerMenuItem(2)}
					type="button"
					onClick={() => {
						navigate("/guide");
						onClose();
					}}
					className="w-full text-left cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded"
					role="menuitem"
				>
					<div className="flex gap-2 items-center">
						<BookOpen className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm">Quick Guide</span>
					</div>
				</button>

				{/* Data Catalogue */}
				<button
					ref={registerMenuItem(3)}
					type="button"
					onClick={() => {
						window.open("https://data.bio.wa.gov.au/", "_blank");
						onClose();
					}}
					className="w-full text-left cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded"
					role="menuitem"
				>
					<div className="flex gap-2 items-center">
						<BookOpen className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm">Data Catalogue</span>
					</div>
				</button>

				{/* Scientific Sites Register */}
				<button
					ref={registerMenuItem(4)}
					type="button"
					onClick={() => {
						window.open("https://scientificsites.dpaw.wa.gov.au/", "_blank");
						onClose();
					}}
					className="w-full text-left cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded"
					role="menuitem"
				>
					<div className="flex gap-2 items-center">
						<BookOpen className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm">Scientific Sites Register</span>
					</div>
				</button>
			</div>

			<Separator />

			{/* Logout Section */}
			<div className="py-1">
				<button
					ref={registerMenuItem(5)}
					type="button"
					onClick={() => {
						logout(undefined, {
							onSuccess: () => {
								navigate("/login", { replace: true });
							},
						});
						onClose();
					}}
					className="w-full text-left cursor-pointer p-2.5 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none rounded text-red-600 dark:text-red-400"
					role="menuitem"
				>
					<div className="flex gap-2 items-center">
						<LogOut className="h-4 w-4" aria-hidden="true" />
						<span className="text-sm font-medium">Logout</span>
					</div>
				</button>
			</div>
		</div>
	);
}
