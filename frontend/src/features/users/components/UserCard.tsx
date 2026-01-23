import { UserAvatar } from "./UserAvatar";
import type { UserCardProps } from "../types/user.types";
import { useNavigate } from "react-router";
import { getUserDisplayName } from "@/shared/utils/user.utils";

/**
 * UserCard component
 * Displays user information in a table-like row format
 * By default, clicking navigates to user detail page
 * Pass onClick to override with custom behavior
 * Pass clickable={false} to make non-clickable (preview mode)
 */
export const UserCard = ({ user, onClick, clickable = true }: UserCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!clickable) {
      return;
    }
    
    if (onClick) {
      // Custom onClick handler
      onClick(user);
    } else {
      // Default navigation
      navigate(`/users/${user.id}`);
    }
  };

  // Card is clickable based on clickable prop
  const isClickable = clickable;

  // Get display name
  const displayName = getUserDisplayName(user) || `No Name (${user.username})`;

  // Truncate long names
  const truncatedName = displayName.length > 30 
    ? `${displayName.substring(0, 30)}...` 
    : displayName;

  // Get role/status text and color
  const getRoleInfo = () => {
    let text = "";
    let colorClass = "";

    // Check if user is a BA Lead (has business_areas_led array with items)
    // Handle both ID array format and object array format
    const isBALead = user.business_areas_led && user.business_areas_led.length > 0;

    if (user.is_superuser) {
      text = user.role === "Executive" ? "Executive" : "Admin";
      if (isBALead) {
        text += " (BA Lead)";
      }
      colorClass = user.role === "Executive" ? "text-orange-600" : "text-blue-600";
    } else if (user.is_staff) {
      text = "Staff";
      if (isBALead) {
        text += " (BA Lead)";
      }
      colorClass = "text-green-600";
    } else {
      text = "External User";
      colorClass = "text-gray-500";
    }

    return { text, colorClass };
  };

  const roleInfo = getRoleInfo();

  // Get branch or affiliation text
  const getSecondaryText = () => {
    if (user.is_staff) {
      return user.branch?.name || "Branch Not Set";
    }
    return user.affiliation?.name || "No Affiliations";
  };

  // Handle email display
  const getEmailDisplay = () => {
    if (!user.email || user.email.endsWith("email.com")) {
      return "(Not Provided)";
    }
    return user.email;
  };

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-[8fr_4fr] xl:grid-cols-[4fr_4fr_2.5fr] items-center p-4 border border-gray-300 dark:border-gray-500 w-full select-none ${isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'} transition-shadow`}
      onClick={isClickable ? handleClick : undefined}
    >
      {/* User info column */}
      <div className="flex ml-2">
        <div className="min-w-[55px] mr-4">
          <UserAvatar user={user} size="xl" />
        </div>

        <div className="ml-2 xl:ml-4 w-full overflow-hidden">
          {isClickable ? (
            <button
              className="font-bold text-left hover:underline text-gray-600"
              onClick={handleClick}
            >
              {truncatedName}
            </button>
          ) : (
            <p className="font-bold text-left text-gray-600">
              {truncatedName}
            </p>
          )}
          <p className={`text-sm ${roleInfo.colorClass}`}>
            {roleInfo.text}
            {!user.is_active && (
              <span className="text-red-600 font-bold"> (Inactive)</span>
            )}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {getSecondaryText()}
          </p>
        </div>
      </div>

      {/* Email column - hidden on mobile, visible on lg+ */}
      <div className="hidden lg:block ml-4 lg:px-4 xl:px-0 w-full overflow-hidden text-ellipsis">
        <p className="truncate">{getEmailDisplay()}</p>
      </div>

      {/* Business Area column - only visible on xl+ */}
      <div className="hidden xl:block ml-4 w-full overflow-hidden text-ellipsis">
        <p className="truncate">{user.business_area?.name || "-"}</p>
      </div>
    </div>
  );
};
