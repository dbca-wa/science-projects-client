import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { RequestMergeUserDialog } from "./RequestMergeUserDialog";
import {
  useToggleAdminStatus,
  useActivateUser,
  useDeactivateUser,
  useDeleteUser,
  useRequestMergeUsers,
} from "../hooks";
import type { IUserData } from "@/shared/types/user.types";
import { Edit, ShieldCheck, ShieldOff, UserCheck, UserX, Trash2 } from "lucide-react";

interface UserAdminActionButtonsProps {
  user: IUserData;
  currentUserId: number;
  onClose?: () => void;
}

type ConfirmDialogType =
  | "toggle-admin"
  | "activate"
  | "deactivate"
  | "delete"
  | null;

/**
 * AdminActionButtons Component
 * Displays admin-only action buttons for user management including edit, toggle admin,
 * activate/deactivate, delete, and merge operations with self-targeting prevention
 */
export const UserAdminActionButtons = ({
  user,
  currentUserId,
  onClose,
}: UserAdminActionButtonsProps) => {
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState<{
    type: ConfirmDialogType;
    open: boolean;
  }>({ type: null, open: false });
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

  // Mutations
  const toggleAdminMutation = useToggleAdminStatus();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();
  const deleteMutation = useDeleteUser();
  const requestMergeMutation = useRequestMergeUsers();

  // Self-targeting check
  const isSelf = user.pk === currentUserId;

  // Handlers
  const handleToggleAdmin = async () => {
    await toggleAdminMutation.mutateAsync(user.pk);
  };

  const handleActivate = async () => {
    await activateMutation.mutateAsync(user.pk);
  };

  const handleDeactivate = async () => {
    await deactivateMutation.mutateAsync(user.pk);
  };

  const handleDelete = async () => {
    // Close the sheet immediately to prevent refetch
    onClose?.();
    await deleteMutation.mutateAsync(user.pk);
  };

  const handleRequestMerge = async () => {
    await requestMergeMutation.mutateAsync({
      primaryUserId: currentUserId,
      secondaryUserIds: [user.pk],
    });
  };

  const handleEdit = () => {
    // If viewing own profile, navigate to /users/me
    if (isSelf) {
      navigate("/users/me");
    } else {
      navigate(`/users/${user.pk}/edit`);
    }
  };

  // Dialog configurations
  const getDialogConfig = (type: ConfirmDialogType) => {
    switch (type) {
      case "toggle-admin":
        return {
          title: user.is_superuser ? "Demote User?" : "Promote User?",
          description: `Are you sure you want to ${user.is_superuser ? "demote" : "promote"} this user ${user.is_superuser ? "from admin" : "to admin"}?`,
          confirmText: user.is_superuser ? "Demote" : "Promote",
          variant: "default" as const,
          onConfirm: handleToggleAdmin,
        };
      case "activate":
        return {
          title: "Reactivate User?",
          description:
            "Are you sure you want to reactivate this user? They will regain access to SPMS.",
          confirmText: "Reactivate",
          variant: "default" as const,
          onConfirm: handleActivate,
        };
      case "deactivate":
        return {
          title: "Deactivate User?",
          description:
            "Are you sure you want to deactivate this user? They will lose access to SPMS but their data will be retained.",
          confirmText: "Deactivate",
          variant: "destructive" as const,
          onConfirm: handleDeactivate,
        };
      case "delete":
        return {
          title: "Delete User?",
          description: (
            <div className="space-y-4">
              <p className="font-bold text-lg text-center">
                Are you sure you want to delete this user?
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>They will be removed from all projects</li>
                <li>
                  Any projects they were leading will require a new project lead
                </li>
                <li>Their comments will be deleted</li>
              </ul>
              <p className="text-center pt-2">
                If this is okay or this is a duplicate account, please proceed.
              </p>
            </div>
          ),
          confirmText: "Delete",
          variant: "destructive" as const,
          onConfirm: handleDelete,
        };
      default:
        return null;
    }
  };

  const dialogConfig = confirmDialog.type
    ? getDialogConfig(confirmDialog.type)
    : null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold text-muted-foreground">
            Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Edit Details */}
            <Button
              onClick={handleEdit}
              className="h-24 flex-col bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSelf && window.location.pathname === "/users/me"}
            >
              <Edit className="size-6 mb-2" />
              <span className="text-xs font-semibold">Edit Details</span>
            </Button>

            {/* Toggle Admin (Promote/Demote) */}
            <Button
              onClick={() =>
                setConfirmDialog({ type: "toggle-admin", open: true })
              }
              className={
                user.is_superuser
                  ? "h-24 flex-col bg-red-600 hover:bg-red-700 text-white"
                  : "h-24 flex-col bg-green-600 hover:bg-green-700 text-white"
              }
              disabled={!user.is_staff || isSelf}
            >
              {user.is_superuser ? (
                <>
                  <ShieldOff className="size-6 mb-2" />
                  <span className="text-xs font-semibold">Demote</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-6 mb-2" />
                  <span className="text-xs font-semibold">Promote</span>
                </>
              )}
            </Button>

            {/* Activate/Deactivate */}
            {user.is_active ? (
              <Button
                onClick={() =>
                  setConfirmDialog({ type: "deactivate", open: true })
                }
                className="h-24 flex-col bg-orange-600 hover:bg-orange-700 text-white"
                disabled={user.is_superuser || isSelf}
              >
                <UserX className="size-6 mb-2" />
                <span className="text-xs font-semibold">Deactivate</span>
              </Button>
            ) : (
              <Button
                onClick={() =>
                  setConfirmDialog({ type: "activate", open: true })
                }
                className="h-24 flex-col bg-orange-600 hover:bg-orange-700 text-white"
              >
                <UserCheck className="size-6 mb-2" />
                <span className="text-xs font-semibold">Reactivate</span>
              </Button>
            )}

            {/* Delete */}
            <Button
              onClick={() => setConfirmDialog({ type: "delete", open: true })}
              className="h-24 flex-col bg-red-600 hover:bg-red-700 text-white"
              disabled={user.is_superuser || isSelf}
            >
              <Trash2 className="size-6 mb-2" />
              <span className="text-xs font-semibold">Delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {dialogConfig && (
        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={dialogConfig.title}
          description={dialogConfig.description}
          onConfirm={dialogConfig.onConfirm}
          variant={dialogConfig.variant}
          confirmText={dialogConfig.confirmText}
        />
      )}

      {/* Merge Dialog */}
      <RequestMergeUserDialog
        open={mergeDialogOpen}
        onOpenChange={setMergeDialogOpen}
        onConfirm={handleRequestMerge}
        user={user}
      />
    </>
  );
};
