import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import type { UserAvatarProps } from "../types/user.types";
import { cn } from "@/shared/lib/utils";

/**
 * Size variants for user avatar
 */
const sizeClasses = {
  sm: "size-8",
  md: "size-12",
  lg: "size-16",
  xl: "h-[55px] w-[55px]",
};

/**
 * UserAvatar component
 * Displays user avatar image with fallback to initials
 * 
 * @param user - User data containing image and name information
 * @param size - Avatar size variant (sm, md, lg)
 */
export const UserAvatar = ({ user, size = "md" }: UserAvatarProps) => {
  // Get user initials for fallback
  const getInitials = () => {
    const firstName = user.display_first_name || user.first_name || "";
    const lastName = user.display_last_name || user.last_name || "";
    
    if (!firstName && !lastName) {
      return user.username?.charAt(0).toUpperCase() || "?";
    }
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get avatar image URL
  const getAvatarUrl = () => {
    if (!user.image) return undefined;
    
    // Handle different image formats
    if (typeof user.image === "string") {
      return user.image;
    }
    
    if (user.image.file) {
      return user.image.file;
    }
    
    return undefined;
  };

  const avatarUrl = getAvatarUrl();
  const initials = getInitials();

  return (
    <Avatar className={cn(sizeClasses[size])}>
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={`${user.display_first_name || user.first_name} ${user.display_last_name || user.last_name}`}
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
