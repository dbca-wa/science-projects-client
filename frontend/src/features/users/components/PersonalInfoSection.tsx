import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import { toast } from "sonner";

interface PersonalInfoSectionProps {
  user: IUserData | IUserMe;
  onClick?: () => void;
}

/**
 * PersonalInfoSection component
 * Displays user's avatar, name, phone, and email with copy button
 * Matches original horizontal flex layout
 * 
 * @param user - User data to display
 * @param onClick - Callback when section is clicked
 */
export const PersonalInfoSection = ({ user, onClick }: PersonalInfoSectionProps) => {
  const displayName = getUserDisplayName(user);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    navigator.clipboard.writeText(user.email);
    toast.success("Email copied to clipboard");
  };

  return (
    <div 
      className={`flex gap-4 mt-4 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <Avatar className="size-20 rounded-full">
        <img 
          src={user.image?.file || user.image?.old_file || "/default-avatar.png"} 
          alt={displayName}
          className="size-full object-cover"
        />
      </Avatar>

      {/* Info */}
      <div className="flex flex-col justify-center flex-1 overflow-auto">
        <div className="flex items-center justify-between">
          <p className="font-bold select-none">{displayName}</p>
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
        <p className="select-none">
          {user.phone ? user.phone : "No Phone number"}
        </p>
        <p className="select-none">
          {user.email?.startsWith("unset") ? "No Email" : user.email}
        </p>
        {!user.email?.startsWith("unset") && (
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 w-fit px-4 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleCopyEmail}
          >
            <Copy className="size-4 mr-2" />
            Copy Email
          </Button>
        )}
      </div>
    </div>
  );
};
