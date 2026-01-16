import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { UserAvatar } from "./UserAvatar";
import type { UserDetailSectionProps } from "../types/user.types";

/**
 * ProfileSection component
 * Displays user's profile information (avatar, about, expertise)
 * 
 * @param user - User data to display
 */
export const ProfileSection = ({ user }: UserDetailSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <UserAvatar user={user} size="lg" />
        </div>

        {/* About */}
        <div>
          <h4 className="text-sm font-medium mb-2">About</h4>
          {user.about ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {user.about}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No information provided
            </p>
          )}
        </div>

        {/* Expertise */}
        <div>
          <h4 className="text-sm font-medium mb-2">Expertise</h4>
          {user.expertise ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {user.expertise}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No expertise listed
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
