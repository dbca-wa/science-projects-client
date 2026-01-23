import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import type { UserAvatarProps } from "../types/user.types";
import { cn } from "@/shared/lib/utils";
import { getUserInitials, getUserDisplayName } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";

/**
 * Size variants for user avatar
 */
const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
  xl: "h-[55px] w-[55px]",
  "2xl": "size-24", // 96px - larger for profile sections
  "3xl": "size-32", // 128px - extra large for main profile display
};

/**
 * UserAvatar component
 * Displays user avatar image with fallback to initials
 * 
 * @param user - User data containing image and name information
 * @param size - Avatar size variant (sm, md, lg)
 */
export const UserAvatar = ({ user, size = "md" }: UserAvatarProps) => {
  // Use shared image utility
  const avatarUrl = getImageUrl(user.image);
  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);

  return (
    <Avatar className={cn(sizeClasses[size])}>
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={displayName}
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
