import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Mail, Phone, Briefcase, Printer } from "lucide-react";
import type { UserDetailSectionProps } from "../types/user.types";

/**
 * PersonalInfoSection component
 * Displays user's personal information (name, email, title, phone, fax)
 * 
 * @param user - User data to display
 */
export const PersonalInfoSection = ({ user }: UserDetailSectionProps) => {
  const displayName = `${user.display_first_name || user.first_name} ${user.display_last_name || user.last_name}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name */}
        <div>
          <h3 className="text-2xl font-bold">{displayName}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="size-4 mt-0.5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Email</p>
            <a 
              href={`mailto:${user.email}`}
              className="text-sm text-primary hover:underline break-all"
            >
              {user.email}
            </a>
          </div>
        </div>

        {/* Title/Role */}
        {user.role && (
          <div className="flex items-start gap-3">
            <Briefcase className="size-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Title</p>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}

        {/* Phone */}
        {user.phone && (
          <div className="flex items-start gap-3">
            <Phone className="size-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Phone</p>
              <a 
                href={`tel:${user.phone}`}
                className="text-sm text-primary hover:underline"
              >
                {user.phone}
              </a>
            </div>
          </div>
        )}

        {/* Fax */}
        {user.fax && (
          <div className="flex items-start gap-3">
            <Printer className="size-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Fax</p>
              <p className="text-sm text-muted-foreground">{user.fax}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
