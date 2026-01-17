import { UserAvatar } from "./UserAvatar";
import type { UserCardProps } from "../types/user.types";
import { useNavigate } from "react-router";
import { getUserDisplayName } from "@/shared/utils/user.utils";

/**
 * UserCard component
 * Displays user information in a table-like row format
 */
export const UserCard = ({ user, onClick }: UserCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(user);
    } else {
      navigate(`/users/${user.pk}`);
    }
  };

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

    if (user.is_superuser) {
      text = user.role === "Executive" ? "Executive" : "Admin";
      colorClass = user.role === "Executive" ? "text-orange-600" : "text-blue-600";
    } else if (user.is_staff) {
      text = `Staff${user.business_area?.leader === user.pk ? " (Business Area Leader)" : ""}`;
      colorClass = "text-green-600";
    } else {
      text = "External User";
      colorClass = "text-gray-500";
    }

    if (!user.is_active) {
      text += " (Inactive)";
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
      className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] xl:grid-cols-[4fr_4fr_2.5fr] items-center p-4 border border-gray-300 dark:border-gray-500 w-full select-none cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {/* User info column */}
      <div className="flex ml-2">
        <div className="min-w-[55px] mr-4">
          <UserAvatar user={user} size="xl" />
        </div>

        <div className="ml-2 xl:ml-4 w-full overflow-hidden">
          <button
            className="font-bold text-left hover:underline text-gray-600"
            onClick={handleClick}
          >
            {truncatedName}
          </button>
          <p className={`text-sm ${roleInfo.colorClass}`}>
            {roleInfo.text}
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
