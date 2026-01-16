import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserForm } from "@/features/users/components/UserForm";

/**
 * UserCreatePage
 * Page for creating a new user (admin only)
 * 
 * Features:
 * - Admin-only access (protected by route guard)
 * - User creation form
 * - Cancel navigation back to user list
 */
export const UserCreatePage = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/users");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Button variant="ghost" onClick={handleCancel} className="mb-8">
        <ArrowLeft className="size-4 mr-2" />
        Back to Users
      </Button>

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create User</h1>
        <p className="text-muted-foreground">
          Add a new user to the system
        </p>
      </div>

      {/* User Form */}
      <UserForm mode="create" onCancel={handleCancel} />
    </div>
  );
};
