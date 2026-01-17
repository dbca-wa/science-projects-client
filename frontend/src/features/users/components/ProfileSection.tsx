import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { UserAvatar } from "./UserAvatar";
import { motion } from "framer-motion";
import { useState } from "react";
import type { IUserData, IUserMe } from "@/shared/types/user.types";

interface ProfileSectionProps {
  user: IUserData | IUserMe;
  onClick?: () => void;
}

/**
 * ProfileSection component
 * Displays user's profile information (avatar, about, expertise)
 * Clickable to open edit modal
 * 
 * @param user - User data to display
 * @param onClick - Callback when section is clicked
 */
export const ProfileSection = ({ user, onClick }: ProfileSectionProps) => {
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
          <CardTitle>Profile</CardTitle>
          {onClick && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              Click to edit
            </motion.span>
          )}
        </div>
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
              (Not Provided)
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
              (Not Provided)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
