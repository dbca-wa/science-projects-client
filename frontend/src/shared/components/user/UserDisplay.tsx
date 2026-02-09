import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { getUserInitials, getUserDisplayName, getUserEmail } from "@/shared/utils/user.utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IUserData } from "@/shared/types/user.types";
import type { IImageData } from "@/shared/types/media.types";

/**
 * Size variants for user display
 */
const sizeVariants = {
  sm: {
    avatar: "size-8",
    name: "text-sm font-medium",
    email: "text-xs text-muted-foreground",
    container: "gap-2",
  },
  md: {
    avatar: "size-12",
    name: "text-base font-medium",
    email: "text-sm text-muted-foreground",
    container: "gap-3",
  },
  lg: {
    avatar: "size-16",
    name: "text-lg font-semibold",
    email: "text-base text-muted-foreground",
    container: "gap-4",
  },
};

export interface UserDisplayProps {
  user: {
    id: number;
    display_first_name: string | null;
    display_last_name: string | null;
    email: string;
    image?: IImageData | string;
  };
  showEmail?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * UserDisplay component
 * Displays user avatar, name, and optionally email in a consistent format
 * Used across caretaker components for consistent user information display
 * 
 * @param user - User data containing avatar, name, and email
 * @param showEmail - Whether to display the email address
 * @param size - Display size variant (sm, md, lg)
 * @param className - Additional CSS classes
 */
export const UserDisplay = ({ 
  user, 
  showEmail = false, 
  size = "md",
  className 
}: UserDisplayProps) => {
  // Use shared image utility
  const avatarUrl = getImageUrl(user.image);
  const initials = getUserInitials(user as IUserData);
  const displayName = getUserDisplayName(user as IUserData);
  const email = getUserEmail(user as IUserData);
  const variant = sizeVariants[size];

  return (
    <div className={cn("flex items-center", variant.container, className)}>
      <Avatar className={cn(variant.avatar)}>
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
      
      <div className="flex flex-col min-w-0 flex-1">
        <span className={cn(variant.name, "truncate")}>
          {displayName}
        </span>
        {showEmail && (
          <span className={cn(variant.email, "truncate")}>
            {email}
          </span>
        )}
      </div>
    </div>
  );
};