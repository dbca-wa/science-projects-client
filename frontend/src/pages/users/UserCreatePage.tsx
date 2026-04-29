import { useNavigate, Link } from "react-router";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { ExternalUserForm } from "@/features/users/components/ExternalUserForm";
import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Info } from "lucide-react";

/**
 * UserCreatePage
 *
 * Page for creating external users (available to all authenticated users).
 * Includes a banner directing admins to the invite system for internal users.
 */
const UserCreatePage = () => {
	useDocumentTitle("Add User");
	const navigate = useNavigate();

	const handleCancel = () => {
		navigate("/users");
	};

	return (
		<PageTransition>
			<div className="w-full">
				<AutoBreadcrumb />

				{/* Page header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold mb-2">Add External User</h1>
					<p className="text-muted-foreground">
						Add a new external user to the system
					</p>
				</div>

				{/* Invite banner — below title */}
				<Alert className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
					<Info className="size-4 text-blue-600 dark:text-blue-400" />
					<AlertDescription className="text-blue-800 dark:text-blue-200">
						Looking to add an internal DBCA user?{" "}
						<Link
							to="/users/invite"
							className="font-medium underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100"
						>
							Invite them instead →
						</Link>
					</AlertDescription>
				</Alert>

				{/* External User Form in card */}
				<div>
					<div className="rounded-xl border bg-card shadow-sm p-6">
						<ExternalUserForm onCancel={handleCancel} />
					</div>
				</div>
			</div>
		</PageTransition>
	);
};

export default UserCreatePage;
