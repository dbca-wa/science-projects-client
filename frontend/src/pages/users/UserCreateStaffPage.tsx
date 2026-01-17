import { useNavigate } from "react-router";
import { Breadcrumb } from "@/shared/components/Breadcrumb";
import { StaffUserForm } from "@/features/users/components/StaffUserForm";

/**
 * UserCreateStaffPage
 * Page for creating DBCA staff users (admin only)
 * 
 * Features:
 * - Admin-only access (protected by route guard)
 * - Staff user creation form
 * - Breadcrumb navigation
 */
export const UserCreateStaffPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/users");
  };

  const breadcrumbItems = [
    { title: "Users", link: "/users" },
    { title: "Add DBCA User" },
  ];

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add DBCA User</h1>
        <p className="text-muted-foreground">
          Manually create a DBCA staff user account
        </p>
      </div>

      {/* Staff User Form */}
      <div className="max-w-4xl">
        <StaffUserForm onCancel={handleCancel} />
      </div>
    </div>
  );
};
