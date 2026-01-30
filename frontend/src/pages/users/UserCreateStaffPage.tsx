import { useNavigate } from "react-router";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
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
const UserCreateStaffPage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/users");
  };

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <AutoBreadcrumb />

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

export default UserCreateStaffPage;
