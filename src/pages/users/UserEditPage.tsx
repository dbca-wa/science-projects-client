import { useNavigate, useParams } from "react-router";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { UserEditForm } from "@/features/users/components/UserEditForm";
import { getUserDisplayName } from "@/shared/utils/user.utils";
import { PageTransition } from "@/shared/components/PageTransition";

/**
 * UserEditPage
 * Page for editing an existing user (admin only)
 *
 * Features:
 * - Admin-only access (protected by route guard)
 * - User edit form with pre-populated data
 * - Breadcrumb navigation
 * - Loading and error states
 */
const UserEditPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const userId = Number(id);

	const { data: user, isLoading, error } = useUserDetail(userId);

	const handleCancel = () => {
		navigate(`/users/${id}/details`);
	};

	const displayName = user ? getUserDisplayName(user) : "";

	// Manual breadcrumbs with dynamic user name
	const manualBreadcrumbs = [
		{ title: "Users", link: "/users" },
		{ title: displayName || "User", link: `/users/${id}/details` },
		{ title: "Edit" },
	];

	// Error state
	if (error) {
		const apiError = error as { status?: number; message?: string };
		const errorMessage =
			apiError.status === 404
				? "User not found"
				: apiError.status === 403
					? "You don't have permission to edit this user"
					: "Failed to load user details";

		return (
			<div className="w-full">
				<AutoBreadcrumb overrideItems={manualBreadcrumbs} />
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Not found state
	if (!isLoading && !user) {
		return (
			<div className="w-full">
				<AutoBreadcrumb overrideItems={manualBreadcrumbs} />
				<div className="text-center py-12">
					<p className="text-muted-foreground">User not found</p>
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
					<div className="text-lg font-medium text-muted-foreground">
						Loading user...
					</div>
				</div>
			</div>
		);
	}

	return (
		<PageTransition>
			<div className="w-full">
				{/* Breadcrumb */}
				<AutoBreadcrumb overrideItems={manualBreadcrumbs} />

				{/* Page header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Edit User</h1>
					<p className="text-muted-foreground">
						Update information for {displayName}
					</p>
				</div>

				{/* User Edit Form */}
				<UserEditForm userId={userId} onCancel={handleCancel} />
			</div>
		</PageTransition>
	);
};

export default UserEditPage;
