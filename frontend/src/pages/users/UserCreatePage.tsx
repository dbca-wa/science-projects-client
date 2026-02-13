import { useNavigate } from "react-router";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { ExternalUserForm } from "@/features/users/components/ExternalUserForm";
import { PageTransition } from "@/shared/components/PageTransition";

/**
 * UserCreatePage
 * Page for creating external users (available to all authenticated users)
 *
 * Features:
 * - Available to all authenticated users
 * - External user creation form
 * - Breadcrumb navigation
 */
const UserCreatePage = () => {
	const navigate = useNavigate();

	const handleCancel = () => {
		navigate("/users");
	};

	return (
		<PageTransition>
			<div className="w-full">
				{/* Breadcrumb */}
				<AutoBreadcrumb />

				{/* Page header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Add External User</h1>
					<p className="text-muted-foreground">
						Add a new external user to the system
					</p>
				</div>

				{/* External User Form */}
				<div className="max-w-4xl">
					<ExternalUserForm onCancel={handleCancel} />
				</div>
			</div>
		</PageTransition>
	);
};

export default UserCreatePage;
