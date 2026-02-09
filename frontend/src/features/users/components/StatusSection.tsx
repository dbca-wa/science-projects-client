import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { format } from "date-fns";

/**
 * StatusSection component
 * Displays user's joined date and account status (Active/Staff/Admin)
 * Matches original simple design with 3-column icon grid
 * 
 * @param user - User data to display
 */
export const StatusSection = ({ user }: { user: IUserData | IUserMe }) => {
  // Check if user is IUserMe (has date_joined)
  const isUserMe = 'date_joined' in user;
  const formattedDate = isUserMe && user.date_joined
    ? format(new Date(user.date_joined), "MMMM d, yyyy")
    : "Unknown";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Joined Date - only show for IUserMe */}
        {isUserMe && (
          <div className="flex">
            <p className="text-sm text-muted-foreground select-none">
              <span className="font-bold">Joined&nbsp;</span>
            </p>
            <p className="text-sm">{formattedDate}</p>
          </div>
        )}

        {/* Status Grid */}
        <div className="mt-4 rounded-xl p-4 bg-muted select-none">
          <div className="grid grid-cols-3 gap-3 w-full">
            {/* Active Status */}
            <div className="flex flex-col justify-center items-center">
              <p className="mb-2 font-bold text-sm text-muted-foreground">
                Active?
              </p>
              {user.is_active ? (
                <CheckCircle2 className="size-6 text-green-500" />
              ) : (
                <XCircle className="size-6 text-red-500" />
              )}
            </div>

            {/* Staff Status */}
            <div className="flex flex-col justify-center items-center">
              <p className="mb-2 font-bold text-sm text-muted-foreground">
                Staff?
              </p>
              {user.is_staff ? (
                <CheckCircle2 className="size-6 text-green-500" />
              ) : (
                <XCircle className="size-6 text-red-500" />
              )}
            </div>

            {/* Admin Status */}
            <div className="flex flex-col justify-center items-center">
              <p className="mb-2 font-bold text-sm text-muted-foreground">
                Admin?
              </p>
              {user.is_superuser ? (
                <CheckCircle2 className="size-6 text-green-500" />
              ) : (
                <XCircle className="size-6 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
