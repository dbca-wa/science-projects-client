import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { UserCard } from "./UserCard";

interface InAppSearchSectionProps {
  user: IUserData | IUserMe;
}

/**
 * InAppSearchSection component
 * Shows how the user appears in SPMS search results using UserCard
 * Non-clickable preview
 * 
 * @param user - User data to display
 */
export const InAppSearchSection = ({ user }: InAppSearchSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">In-App Search Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          This is how your account will appear when searched within SPMS
        </p>
        <div className="p-2">
          {/* Pass clickable={false} to make it non-clickable */}
          <UserCard user={user} clickable={false} />
        </div>
      </CardContent>
    </Card>
  );
};
