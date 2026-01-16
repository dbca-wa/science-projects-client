import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Building2, Briefcase, Users } from "lucide-react";
import type { UserDetailSectionProps } from "../types/user.types";

/**
 * MembershipSection component
 * Displays user's organizational membership (branch, business area, affiliation)
 * 
 * @param user - User data to display
 */
export const MembershipSection = ({ user }: UserDetailSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Branch */}
        <div className="flex items-start gap-3">
          <Building2 className="size-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Branch</p>
            {user.branch ? (
              <p className="text-sm text-muted-foreground">{user.branch.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not assigned</p>
            )}
          </div>
        </div>

        {/* Business Area */}
        <div className="flex items-start gap-3">
          <Briefcase className="size-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Business Area</p>
            {user.business_area ? (
              <p className="text-sm text-muted-foreground">{user.business_area.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not assigned</p>
            )}
          </div>
        </div>

        {/* Affiliation */}
        <div className="flex items-start gap-3">
          <Users className="size-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Affiliation</p>
            {user.affiliation ? (
              <p className="text-sm text-muted-foreground">{user.affiliation.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Not specified</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
