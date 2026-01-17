import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { motion } from "framer-motion";
import { useState } from "react";
import type { IUserData, IUserMe } from "@/shared/types/user.types";

interface PersonalInformationCardProps {
  user: IUserData | IUserMe;
  onClick?: () => void;
}

/**
 * PersonalInformationCard component
 * Displays personal details: Title, First/Last Name, Phone, Fax, Email
 * Clickable card to open edit modal
 * 
 * @param user - User data to display
 * @param onClick - Callback when card is clicked
 */
export const PersonalInformationCard = ({ user, onClick }: PersonalInformationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getTitleDisplay = (title: string | null | undefined) => {
    if (!title) return "--";
    const titleMap: Record<string, string> = {
      mr: "Mr",
      mrs: "Mrs",
      ms: "Ms",
      aprof: "A/Prof",
      prof: "Prof",
      dr: "Dr",
    };
    return titleMap[title.toLowerCase()] || title;
  };

  return (
    <Card 
      className={onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Personal Information</CardTitle>
          {onClick && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-primary"
            >
              Click to edit
            </motion.span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Optionally adjust these details for in-app and PDF display (including annual report). Your email cannot be changed.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">First Name</p>
            <p>{user.display_first_name || user.first_name}</p>
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">Last Name</p>
            <p>{user.display_last_name || user.last_name}</p>
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">Phone</p>
            <p>{user.phone || "--"}</p>
          </div>

          {/* Fax */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">Fax</p>
            <p>{user.fax || "--"}</p>
          </div>

          {/* Title */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">Title</p>
            <p>{getTitleDisplay(user.title)}</p>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">Email Address</p>
            <p>{user.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
