import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/store-context";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { getImageUrl } from "@/shared/utils/image.utils";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { IoCaretDown } from "react-icons/io5";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import NavitarContent from "./NavitarContent";

interface NavitarProps {
	shouldShowName?: boolean;
}

/**
 * Navitar component - User avatar dropdown menu
 * Wrapped with observer to react to user data loading
 */
export const Navitar = observer(({ shouldShowName = false }: NavitarProps) => {
	const authStore = useAuthStore();
	const { data: currentUser } = useCurrentUser();
	const { width: windowSize } = useWindowSize();
	const [open, setOpen] = useState(false);

	// Use fresh user data from TanStack Query, fallback to authStore
	const userData = currentUser || authStore.user;

	// Calculate display name with truncation logic
	const displayName = userData?.display_first_name
		? userData.display_first_name.length < 12
			? userData.display_first_name
			: windowSize >= BREAKPOINTS.xl
				? userData.display_first_name
				: `${userData.display_first_name.substring(0, 9)}...`
		: userData?.username;

	const avatarSrc = getImageUrl(userData?.image);
	const userInitial = userData?.username
		? userData.username.charAt(0).toUpperCase()
		: "U";

	return (
		<div className="relative">
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<button className="flex items-center gap-1 cursor-pointer select-none">
						{shouldShowName && displayName && (
							<span className="mx-3 text-sm font-medium text-white/90">
								{displayName}
							</span>
						)}
						<Avatar className="h-8 w-8">
							<AvatarImage src={avatarSrc} alt={displayName} />
							<AvatarFallback>{userInitial}</AvatarFallback>
						</Avatar>
						<IoCaretDown size={13} className="ml-1 text-white/90" />
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="!z-[99999] !p-0 w-80" align="end">
					<NavitarContent onClose={() => setOpen(false)} />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
});
