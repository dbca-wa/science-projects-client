import { UserCard } from "./UserCard";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { IUserData } from "@/shared/types/user.types";

interface UserGridProps {
  users: IUserData[];
  isLoading?: boolean;
}

/**
 * UserGrid component
 * Displays users in a single-column list layout
 */
export const UserGrid = ({ users, isLoading }: UserGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <UserCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <div className="grid grid-cols-1">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
};

/**
 * UserCardSkeleton component
 * Loading skeleton for user list items
 */
const UserCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] xl:grid-cols-[4fr_4fr_2.5fr] items-center p-4 border border-gray-300 dark:border-gray-500 w-full">
      <div className="flex ml-2">
        <div className="min-w-[55px] mr-4">
          <Skeleton className="h-[55px] w-[55px] rounded-full" />
        </div>
        <div className="ml-2 xl:ml-4 w-full space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="hidden lg:block ml-4 lg:px-4 xl:px-0">
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="hidden xl:block ml-4">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
};
