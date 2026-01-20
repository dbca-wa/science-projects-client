import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { useCaretakerCheck } from "@/features/users/hooks/useCaretakerCheck";
import { useBecomeCaretaker } from "@/features/users/hooks/useBecomeCaretaker";
import { useCancelBecomeCaretakerRequest } from "@/features/users/hooks/useCancelBecomeCaretakerRequest";
import { UserAdminActionButtons } from "./UserAdminActionButtons";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Badge } from "@/shared/components/ui/badge";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/shared/components/ui/avatar";
import {
	AlertCircle,
	Copy,
	Mail,
	UserPlus,
	X,
	Check,
	GitMerge,
	Users,
	ExternalLink,
	Loader2,
} from "lucide-react";
import { AiFillCloseCircle } from "react-icons/ai";
import { useAuthStore } from "@/app/stores/useStore";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import { useNavigate } from "react-router";
import { Sheet, SheetContent } from "@/shared/components/ui/custom/CustomSheet";
import type { ICaretakerSimpleUserData } from "@/shared/types/user.types";
import {
	getUserDisplayName,
	getUserInitials,
	hasValidEmail,
	getUserEmail,
	getUserPhone,
} from "@/shared/utils/user.utils";
import { getSanitizedHtmlOrFallback } from "@/shared/utils/html.utils";
import { UserDisplay } from "@/shared/components/UserDisplay";

interface UserDetailSheetProps {
	userId: number | null;
	open: boolean;
	onClose: () => void;
}

/**
 * UserDetailSheet component
 * Displays user details in a side sheet matching the original Chakra UI design
 */
export const UserDetailSheet = observer(
	({ userId, open, onClose }: UserDetailSheetProps) => {
		const authStore = useAuthStore();
		const navigate = useNavigate();
		const [showBecomeCaretakerDialog, setShowBecomeCaretakerDialog] =
			useState(false);
		const [showCancelBecomeDialog, setShowCancelBecomeDialog] =
			useState(false);

		// Fetch user details
		const { data: user, isLoading, error } = useUserDetail(userId || 0);

		// Fetch current user's caretaker check to see if there's a pending become_caretaker_request
		const { data: myCaretakerData } = useCaretakerCheck();

		// Mutation hooks for become caretaker functionality
		const becomeCaretakerMutation = useBecomeCaretaker();
		const cancelBecomeCaretakerMutation = useCancelBecomeCaretakerRequest();

		const handleCopyEmail = () => {
			if (user?.email) {
				navigator.clipboard.writeText(user.email);
				toast.success("Email copied to clipboard");
			}
		};

		const handleEmailUser = () => {
			if (user?.email) {
				window.open(`mailto:${user.email}`);
			}
		};

		const handleAddToProject = () => {
			// TODO: Implement add to project modal
			toast.info("Add to project functionality will be implemented soon");
		};

		const accountIsStaff = user?.is_staff;
		const accountIsSuper = user?.is_superuser;
		const viewingUserIsSuper = authStore.isSuperuser;
		const isViewingOwnProfile = user?.pk === authStore.user?.pk;

		// Check if current user is admin or business area lead
		const currentUserIsAdmin = authStore.user?.is_superuser || false;
		const currentUserIsBALead = 
			authStore.user?.business_areas_led && 
			authStore.user.business_areas_led.length > 0;
		const canBecomeCaretaker = currentUserIsAdmin || currentUserIsBALead;

		// Check if there's a pending become_caretaker_request for this user
		const pendingBecomeRequest =
			myCaretakerData?.become_caretaker_request_object;
		const hasPendingBecomeRequest =
			pendingBecomeRequest?.status === "pending" &&
			pendingBecomeRequest?.primary_user?.pk === user?.pk;

		// Check if user already has a caretaker
		const userHasCaretaker =
			user &&
			"caretakers" in user &&
			Array.isArray(user.caretakers) &&
			user.caretakers.length > 0;

		// Check if current user is already this user's caretaker
		const isAlreadyCaretaker =
			user &&
			"caretakers" in user &&
			Array.isArray(user.caretakers) &&
			user.caretakers.some((c: ICaretakerSimpleUserData) => c.pk === authStore.user?.pk);

		// Disable button if: viewing own profile, user has caretaker, already caretaker, or not authorized
		const isBecomeCaretakerDisabled =
			isViewingOwnProfile || userHasCaretaker || isAlreadyCaretaker || !canBecomeCaretaker;

		const handleBecomeCaretaker = () => {
			if (hasPendingBecomeRequest) {
				setShowCancelBecomeDialog(true);
			} else {
				setShowBecomeCaretakerDialog(true);
			}
		};

		const handleConfirmBecomeCaretaker = () => {
			if (!user?.pk || !authStore.user?.pk) return;

			becomeCaretakerMutation.mutate(
				{
					userPk: user.pk,
					caretakerPk: authStore.user.pk,
				},
				{
					onSuccess: () => {
						setShowBecomeCaretakerDialog(false);
					},
				},
			);
		};

		const handleConfirmCancelBecome = () => {
			if (!pendingBecomeRequest?.id || !user?.pk) return;

			cancelBecomeCaretakerMutation.mutate(
				{
					taskId: pendingBecomeRequest.id,
					userPk: user.pk,
				},
				{
					onSuccess: () => {
						setShowCancelBecomeDialog(false);
					},
				},
			);
		};

		return (
			<Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
				<SheetContent
					side="right"
					className="w-full sm:max-w-2xl overflow-y-auto p-0"
				>
					{/* Close button - visible on all screen sizes */}
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="absolute right-4 top-4 z-10 size-8"
					>
						<X className="size-4" />
					</Button>

					{/* Loading state */}
					{isLoading && (
						<div className="space-y-6 p-6">
							<Skeleton className="h-8 w-48" />
							<Skeleton className="h-64" />
							<Skeleton className="h-64" />
						</div>
					)}

					{/* Error state */}
					{error && (
						<div className="p-6">
							<Alert variant="destructive">
								<AlertCircle className="size-4" />
								<AlertDescription>
									Failed to load user details
								</AlertDescription>
							</Alert>
						</div>
					)}

					{/* User details */}
					{user && (
						<div className="flex flex-col h-full p-6">
							{/* Header Section */}
							<div className="flex gap-4 mb-4">
								<Avatar className="size-24">
									<AvatarImage
										src={
											user.image?.file ||
											user.image?.old_file
										}
									/>
									<AvatarFallback>
										{getUserInitials(user)}
									</AvatarFallback>
								</Avatar>

								<div className="flex-1 flex flex-col justify-center overflow-auto">
									<p className="font-bold text-base">
										{getUserDisplayName(user)}
									</p>
									<p className="text-sm">
										{getUserPhone(user)}
									</p>
									<div className="flex items-center gap-2">
										<p className="text-sm">
											{getUserEmail(user)}
										</p>
									</div>
									{hasValidEmail(user) && (
										<Button
											size="sm"
											variant="ghost"
											onClick={handleCopyEmail}
											className="mt-2 w-fit px-4 bg-blue-500 hover:bg-blue-400 text-white"
										>
											<Copy className="size-4 mr-2" />
											Copy Email
										</Button>
									)}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="grid grid-cols-2 gap-4 mb-4 pt-2 pb-4">
								<Button
									onClick={handleEmailUser}
									disabled={!hasValidEmail(user)}
									className="bg-blue-500 hover:bg-blue-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<Mail className="size-4 mr-2" />
									Email
								</Button>
								<Button
									onClick={handleAddToProject}
									disabled={
										user.email === authStore.user?.email
									}
									className="bg-green-500 hover:bg-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<UserPlus className="size-4 mr-2" />
									Add to Project
								</Button>
							</div>

							{/* Organization Info Section */}
							<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-2">
								<div className="flex flex-col">
									{accountIsStaff && (
										<div className="flex h-[60px]">
											<img
												src="/dbca.jpg"
												alt="Agency logo"
												className="rounded-lg w-[60px] h-[60px] object-cover pointer-events-none select-none"
											/>
											<div className="flex ml-3 flex-col justify-center">
												<p className="font-bold text-gray-600 dark:text-gray-300">
													Department of Biodiversity,
													Conservation and Attractions
												</p>
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{user.branch?.name
														? `${user.branch.name} Branch`
														: "Branch not set"}
												</p>
												<p className="text-sm text-blue-600 dark:text-gray-400">
													{user.business_area
														?.name ? (
														<>
															{
																user
																	.business_area
																	.name
															}
														</>
													) : (
														"Business Area not set"
													)}
												</p>
											</div>
										</div>
									)}
									{!accountIsStaff && (
										<p className="text-gray-600 dark:text-gray-300">
											<b>External User</b> - This user
											does not belong to DBCA
										</p>
									)}
								</div>
							</div>

							{/* About Section */}
							<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
								<p className="font-bold text-sm mb-1 text-gray-600 dark:text-gray-300">
									About
								</p>
								<div
									className="mt-1"
									dangerouslySetInnerHTML={{
										__html: getSanitizedHtmlOrFallback(
											user.about,
										),
									}}
								/>
								<p className="font-bold text-sm mb-1 mt-4 text-gray-600 dark:text-gray-300">
									Expertise
								</p>
								<div
									className="mt-1"
									dangerouslySetInnerHTML={{
										__html: getSanitizedHtmlOrFallback(
											user.expertise,
										),
									}}
								/>
							</div>

							{/* Involved Projects Section - Placeholder */}
							<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
								<p className="font-bold text-sm mb-3 text-gray-600 dark:text-gray-300">
									Involved Projects
								</p>
								<div className="text-center py-8 text-muted-foreground">
									<p className="text-sm">
										Project involvement will be displayed
										here after the Projects feature is
										implemented.
									</p>
								</div>
							</div>

							{/* Caretaker Section - Who is caretaking FOR this user */}
							<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
								<div className="flex items-center justify-between mb-3">
									<p className="font-bold text-sm text-gray-600 dark:text-gray-300">
										Caretaker
									</p>
									{user.pk === authStore.user?.pk && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												onClose();
												navigate("/users/me/caretaker");
											}}
											className="text-blue-600 hover:text-blue-700"
										>
											<ExternalLink className="size-3 mr-1" />
											Manage
										</Button>
									)}
								</div>

								{user.caretakers &&
								user.caretakers.length > 0 ? (
									<div className="space-y-3">
										{user.caretakers
											.slice(0, 2)
											.map((caretaker: ICaretakerSimpleUserData) => {
												const isExpired =
													caretaker.end_date
														? isPast(
																new Date(
																	caretaker.end_date,
																),
															)
														: false;

												return (
													<div
														key={caretaker.pk}
														className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg"
													>
														<div className="flex-1 min-w-0">
															<UserDisplay
																user={caretaker}
																showEmail={
																	false
																}
																size="sm"
															/>
															{caretaker.end_date && (
																<p
																	className={`text-xs mt-1 ${isExpired ? "text-red-600" : "text-muted-foreground"}`}
																>
																	Until{" "}
																	{format(
																		new Date(
																			caretaker.end_date,
																		),
																		"MMM d, yyyy",
																	)}
																	{isExpired &&
																		" (Expired)"}
																</p>
															)}
														</div>
														<Badge
															variant="secondary"
															className={
																isExpired
																	? "bg-red-100 text-red-800"
																	: "bg-green-100 text-green-800"
															}
														>
															{isExpired
																? "Expired"
																: "Active"}
														</Badge>
													</div>
												);
											})}

										{user.caretakers.length > 2 && (
											<p className="text-xs text-muted-foreground text-center">
												+{user.caretakers.length - 2}{" "}
												more caretaker
												{user.caretakers.length - 2 > 1
													? "s"
													: ""}
											</p>
										)}
									</div>
								) : (
									<div className="text-center py-4 text-muted-foreground">
										<Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
										<p className="text-sm">
											{user.pk === authStore.user?.pk
												? "You don't have any caretakers assigned"
												: "This user doesn't have any caretakers assigned"}
										</p>
									</div>
								)}

								{/* Become Caretaker Button - Only show when viewing another user's profile */}
								{!isViewingOwnProfile && (
									<div className="mt-4 space-y-2">
										{!canBecomeCaretaker && (
											<p className="text-sm text-muted-foreground text-center">
												Only admins and business area leads can assign caretakers
											</p>
										)}
										{canBecomeCaretaker && hasPendingBecomeRequest && (
											<p className="text-sm text-muted-foreground text-center">
												Your request has been made to
												become this user's caretaker
											</p>
										)}
										{canBecomeCaretaker && (
											<Button
												onClick={handleBecomeCaretaker}
												disabled={
													isBecomeCaretakerDisabled &&
													!hasPendingBecomeRequest
												}
												className={`w-full ${
													hasPendingBecomeRequest
														? "bg-red-500 hover:bg-red-400 text-white"
														: "bg-green-500 hover:bg-green-400 text-white"
												} disabled:opacity-50 disabled:cursor-not-allowed`}
											>
												{becomeCaretakerMutation.isPending ||
												cancelBecomeCaretakerMutation.isPending ? (
													<>
														<Loader2 className="size-4 mr-2 animate-spin" />
														{hasPendingBecomeRequest
															? "Cancelling..."
															: "Requesting..."}
													</>
												) : hasPendingBecomeRequest ? (
													"Cancel Request"
												) : (
													"Become Caretaker"
												)}
											</Button>
										)}
									</div>
								)}
							</div>

							{/* Caretaking Section - Who this user is caretaking FOR */}
							{user.caretaking_for &&
								user.caretaking_for.length > 0 && (
									<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
										<div className="flex items-center justify-between mb-3">
											<p className="font-bold text-sm text-gray-600 dark:text-gray-300">
												Caretaking For
											</p>
											{user.pk === authStore.user?.pk && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => {
														onClose();
														navigate(
															"/users/me/caretaker",
														);
													}}
													className="text-blue-600 hover:text-blue-700"
												>
													<ExternalLink className="size-3 mr-1" />
													View All
												</Button>
											)}
										</div>

										<div className="space-y-3">
											{user.caretaking_for
												.slice(0, 2)
												.map((caretakee: ICaretakerSimpleUserData) => {
													const isExpired =
														caretakee.end_date
															? isPast(
																	new Date(
																		caretakee.end_date,
																	),
																)
															: false;

													return (
														<div
															key={caretakee.pk}
															className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
														>
															<div className="flex-1 min-w-0">
																<UserDisplay
																	user={
																		caretakee
																	}
																	showEmail={
																		false
																	}
																	size="sm"
																/>
																{caretakee.end_date && (
																	<p
																		className={`text-xs mt-1 ${isExpired ? "text-red-600" : "text-muted-foreground"}`}
																	>
																		Until{" "}
																		{format(
																			new Date(
																				caretakee.end_date,
																			),
																			"MMM d, yyyy",
																		)}
																		{isExpired &&
																			" (Expired)"}
																	</p>
																)}
															</div>
															<Badge
																variant="secondary"
																className={
																	isExpired
																		? "bg-red-100 text-red-800"
																		: "bg-blue-100 text-blue-800"
																}
															>
																{isExpired
																	? "Expired"
																	: "Active"}
															</Badge>
														</div>
													);
												})}

											{user.caretaking_for.length > 2 && (
												<p className="text-xs text-muted-foreground text-center">
													+
													{user.caretaking_for
														.length - 2}{" "}
													more user
													{user.caretaking_for
														.length -
														2 >
													1
														? "s"
														: ""}
												</p>
											)}
										</div>
									</div>
								)}

							{/* Merge Section - Placeholder (only show for superusers viewing other users) */}
							{viewingUserIsSuper &&
								user.pk !== authStore.user?.pk && (
									<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
										<p className="font-bold text-sm mb-3 text-gray-600 dark:text-gray-300">
											Merge Accounts
										</p>
										<p className="text-sm text-muted-foreground mb-4">
											Merge this user account with your
											account. This action will transfer
											all projects, comments, and data to
											your account.
										</p>
										<Button
											onClick={() => {
												// TODO: Implement merge functionality
												toast.info(
													"Merge functionality will be implemented soon",
												);
											}}
											variant="outline"
											className="w-full border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
										>
											<GitMerge className="size-4 mr-2" />
											Merge with My Account
										</Button>
									</div>
								)}

							{/* Admin Actions - only show for superusers */}
							{viewingUserIsSuper && authStore.user && (
								<UserAdminActionButtons
									user={user}
									currentUserId={authStore.user.pk!}
									onClose={onClose}
								/>
							)}

							{/* Details Section */}
							<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
								<p className="font-bold text-sm mb-1 text-gray-600 dark:text-gray-300">
									Details
								</p>

								<div className="mt-4 rounded-xl p-4 bg-gray-50 dark:bg-gray-600">
									<div className="grid grid-cols-3 gap-3 w-full">
										{/* Active Status */}
										<div className="flex flex-col justify-center items-center">
											<p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
												Active?
											</p>
											{user.is_active ? (
												<Check className="size-6 text-green-500" />
											) : (
												<AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
											)}
										</div>

										{/* Staff Status */}
										<div className="flex flex-col justify-center items-center">
											<p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
												Staff?
											</p>
											{accountIsStaff ? (
												<Check className="size-6 text-green-500" />
											) : (
												<AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
											)}
										</div>

										{/* Admin Status */}
										<div className="flex flex-col justify-center items-center">
											<p className="mb-2 font-bold text-gray-500 dark:text-gray-400 text-sm">
												Admin?
											</p>
											{accountIsSuper ? (
												<Check className="size-6 text-green-500" />
											) : (
												<AiFillCloseCircle className="size-6 text-red-500 dark:text-red-600" />
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</SheetContent>

				{/* Become Caretaker Confirmation Dialog */}
				<AlertDialog
					open={showBecomeCaretakerDialog}
					onOpenChange={setShowBecomeCaretakerDialog}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Become Caretaker?
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to become{" "}
								{user?.display_first_name}{" "}
								{user?.display_last_name}'s caretaker?
								<span className="block mt-2">
									A request will be made to admins to approve
									your request.
								</span>
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleConfirmBecomeCaretaker}
								className="bg-green-600 hover:bg-green-700 text-white"
							>
								{becomeCaretakerMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Requesting...
									</>
								) : (
									"Become Caretaker"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Cancel Become Caretaker Request Dialog */}
				<AlertDialog
					open={showCancelBecomeDialog}
					onOpenChange={setShowCancelBecomeDialog}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Cancel Caretaker Request
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to cancel your request to
								become {user?.display_first_name}{" "}
								{user?.display_last_name}'s caretaker?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Keep Request</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleConfirmCancelBecome}
								className="bg-red-600 hover:bg-red-700 text-white"
							>
								{cancelBecomeCaretakerMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Cancelling...
									</>
								) : (
									"Cancel Request"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</Sheet>
		);
	},
);
