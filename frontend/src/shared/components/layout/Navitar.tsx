import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useAuthStore } from "@/app/stores/useStore";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { API_CONFIG } from "@/shared/services/api/config";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/custom/CustomPopover";
import { IoCaretDown } from "react-icons/io5";
import { cn } from "@/shared/lib/utils";
import { useWindowSize } from "@/shared/hooks/useWindowSize";
import { BREAKPOINTS } from "@/shared/constants/breakpoints";
import NavitarContent from "./NavitarContent";

interface NavitarProps {
  isModern: boolean;
  shouldShowName?: boolean;
}

/**
 * Navitar component - User avatar dropdown menu
 * Wrapped with observer to react to user data loading
 * Uses CustomPopover (no animations, returns null when closed)
 */
export const Navitar = observer(({ isModern, shouldShowName = false }: NavitarProps) => {
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

  // Get avatar URL with base URL prepended if needed
  const getAvatarUrl = () => {
    const image = userData?.image;
    if (!image) return undefined;
    
    if (image.file) {
      return image.file.startsWith("http")
        ? image.file
        : `${API_CONFIG.BASE_URL.replace('/api/v1/', '')}${image.file}`;
    }
    
    if (image.old_file) {
      return image.old_file.startsWith("http")
        ? image.old_file
        : `${API_CONFIG.BASE_URL.replace('/api/v1/', '')}${image.old_file}`;
    }
    
    return undefined;
  };

  const avatarSrc = getAvatarUrl();
  const userInitial = userData?.username
    ? userData.username.charAt(0).toUpperCase()
    : "U";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 cursor-pointer select-none">
          {shouldShowName && displayName && (
            <span
              className={cn(
                "mx-3 text-sm font-medium",
                isModern
                  ? "text-gray-800 dark:text-gray-200"
                  : "text-white/90"
              )}
            >
              {displayName}
            </span>
          )}
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <IoCaretDown
            size={13}
            className={cn(
              "ml-1",
              isModern
                ? "text-gray-800 dark:text-gray-200"
                : "text-white/90"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent className="!z-[99999] !p-0 w-80" align="end">
        <NavitarContent onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
});
