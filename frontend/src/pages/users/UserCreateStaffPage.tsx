import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Info, AlertTriangle, Lock, Unlock } from "lucide-react";
import { StaffUserForm } from "@/features/users/components/StaffUserForm";

/**
 * UserCreateStaffPage
 *
 * Admin-only page for directly creating DBCA staff user accounts.
 * Encourages using the invite system first via a prominent banner.
 * Direct creation is gated behind an acknowledgement step.
 */
const UserCreateStaffPage = () => {
	useDocumentTitle("Add DBCA User");
	const navigate = useNavigate();
	const [directCreationEnabled, setDirectCreationEnabled] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	const handleCancel = () => {
		navigate("/users");
	};

	return (
		<PageTransition>
			<div className="w-full">
				<AutoBreadcrumb />

				{/* Page header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold mb-2">Add DBCA User</h1>
					<p className="text-muted-foreground">
						Manually create a DBCA staff user account (admin only)
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

				<div className="space-y-6">
					{/* Direct creation card */}
					<div className="rounded-xl border bg-card shadow-sm">
						{!directCreationEnabled ? (
							/* Locked state */
							<div className="p-6 space-y-5">
								<Alert className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
									<AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
									<AlertDescription className="text-amber-800 dark:text-amber-200">
										Direct creation bypasses the invite system and may cause
										data inconsistencies with OIM. Only use this for users who
										cannot be found in IT Assets.
									</AlertDescription>
								</Alert>

								<div className="flex items-center justify-center py-4">
									<Button
										variant="outline"
										size="lg"
										onClick={() => setShowConfirmDialog(true)}
										className="gap-2.5 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
									>
										<Lock className="size-4" />I understand, enable direct
										creation
									</Button>
								</div>
							</div>
						) : (
							/* Unlocked state — form visible */
							<div className="p-6">
								<div className="flex items-center gap-2 mb-4 text-sm text-amber-700 dark:text-amber-300">
									<Unlock className="size-4" />
									<span>Direct creation mode is active</span>
								</div>
								<StaffUserForm onCancel={handleCancel} />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Confirmation dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Enable direct creation?</AlertDialogTitle>
						<AlertDialogDescription>
							Direct creation should only be used when the user cannot be found
							via IT Assets search. Accounts created directly may have data
							inconsistencies with OIM.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								setDirectCreationEnabled(true);
								setShowConfirmDialog(false);
							}}
						>
							Enable direct creation
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</PageTransition>
	);
};

export default UserCreateStaffPage;
