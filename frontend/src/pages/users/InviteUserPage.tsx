import { useState } from "react";
import { toast } from "sonner";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { PageTransition } from "@/shared/components/PageTransition";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
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
import { Mail } from "lucide-react";
import { ITAssetsSearchDropdown } from "@/features/users/components/ITAssetsSearchDropdown";
import { useInviteUser } from "@/features/users/hooks/useInviteUser";
import type { ITAssetUser } from "@/features/users/services/user.service";

/**
 * InviteUserPage
 *
 * Shared page for inviting DBCA staff users via IT Assets search.
 * Accessible to all authenticated users (not admin-only).
 * Shows a confirmation dialog before sending the invite email.
 */
const InviteUserPage = () => {
	useDocumentTitle("Invite DBCA User");
	const inviteMutation = useInviteUser();
	const [pendingUser, setPendingUser] = useState<ITAssetUser | null>(null);

	const handleSelect = (user: ITAssetUser) => {
		if (user.already_invited) {
			toast.info(`${user.name} has already been invited`);
			return;
		}
		// Show confirmation dialog instead of immediately inviting
		setPendingUser(user);
	};

	const handleConfirmInvite = () => {
		if (!pendingUser) return;

		const nameParts = pendingUser.name.trim().split(/\s+/);
		const firstName = nameParts[0] || "";
		const lastName = nameParts.slice(1).join(" ") || "";

		inviteMutation.mutate(
			{
				email: pendingUser.email,
				first_name: firstName,
				last_name: lastName,
			},
			{
				onSuccess: () => {
					toast.success(`Invitation sent to ${pendingUser.name}`);
					setPendingUser(null);
				},
				onError: () => {
					setPendingUser(null);
				},
			}
		);
	};

	return (
		<PageTransition>
			<div className="w-full">
				<AutoBreadcrumb />

				{/* Page header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">Invite a DBCA User</h1>
					<p className="text-muted-foreground">
						Search IT Assets to find and invite an internal DBCA staff member to
						SPMS. They will receive an invitation email and their account will
						be created automatically when they first visit the site.
					</p>
				</div>

				<div>
					<div className="rounded-xl border bg-card shadow-sm p-6">
						<ITAssetsSearchDropdown
							onSelect={handleSelect}
							label="Search IT Assets"
							placeholder="Search by name or email..."
							disabled={inviteMutation.isPending}
						/>

						{inviteMutation.isPending && (
							<p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
								Sending invitation...
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Confirmation dialog */}
			<AlertDialog
				open={!!pendingUser}
				onOpenChange={(open) => {
					if (!open) setPendingUser(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<Mail className="size-5 text-blue-600" />
							Send invitation?
						</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className="space-y-3">
								<p>
									This will send an invitation email to the following person.
									Their SPMS account will be created automatically when they
									first visit the site.
								</p>
								{pendingUser && (
									<div className="rounded-lg border bg-muted/50 p-3">
										<p className="font-medium">{pendingUser.name}</p>
										<p className="text-sm text-muted-foreground">
											{pendingUser.email}
										</p>
										{pendingUser.title && (
											<p className="text-sm text-muted-foreground">
												{pendingUser.title}
											</p>
										)}
									</div>
								)}
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={inviteMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmInvite}
							disabled={inviteMutation.isPending}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{inviteMutation.isPending ? "Sending..." : "Send Invitation"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</PageTransition>
	);
};

export default InviteUserPage;
