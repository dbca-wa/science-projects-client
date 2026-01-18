import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Building2, Briefcase, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { ClickToEditBadge } from "@/shared/components/ClickToEditBadge";

interface MembershipSectionProps {
  user: IUserData | IUserMe;
  onClick?: () => void;
}

/**
 * MembershipSection component
 * Displays user's organizational membership (branch, business area, affiliation)
 * Clickable to open edit modal
 * 
 * @param user - User data to display
 * @param onClick - Callback when section is clicked
 */
export const MembershipSection = ({ user, onClick }: MembershipSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Membership</CardTitle>
          {onClick && <ClickToEditBadge isVisible={isHovered} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {user.is_staff ? (
                user.affiliation ? (
                  <p className="text-sm text-muted-foreground">{user.affiliation.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Not specified</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">External</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
