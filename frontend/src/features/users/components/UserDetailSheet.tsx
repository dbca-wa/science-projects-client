import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { useCaretakerCheck, usePendingCaretakerRequests, useBecomeCaretaker, useCancelBecomeCaretakerRequest } from "@/features/caretakers/hooks";
import { useInvolvedProjects } from "@/features/projects/hooks/useInvolvedProjects";
import { UserAdminActionButtons } from "./UserAdminActionButtons";
import { ProjectsDataTable } from "@/features/projects/components/ProjectsDataTable";
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
import { useAuthStore } from "@/app/stores/store-context";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import { useNavigate } from "react-router";
import { Sheet, SheetContent } from "@/shared/components/ui/sheet";
import type { ICaretakerSimpleUserData } from "@/shared/types/user.types";
import {
	getUserDisplayName,
	getUserInitials,
	hasValidEmail,
	getUserEmail,
	getUserPhone,
} from "@/shared/utils/user.utils";
import { getSanitizedHtmlOrFallback } from "@/shared/utils/html.utils";
import { UserDisplay } from "@/shared/components/user";
import { getImageUrl } from "@/shared/utils/image.utils";

interface UserDetailSheetProps {
	userId: number | null;
	open: boolean;
	onClose: () => void;
}

/**
 * UserDetailSheet component
 * Displays user details in a side sheet
 * Uses Sheet component with MobX-compatible animations
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

		// Fetch involved projects for this user
		const {
			data: involvedProjects,
			isLoading: projectsLoading,
			isError: projectsError,
		} = useInvolvedProjects(userId || 0);

		// Fetch current user's caretaker check to see if there's a pending become_caretaker_request
		const { data: myCaretakerData } = useCaretakerCheck();

		const accountIsStaff = user?.is_staff;
		const accountIsSuper = user?.is_superuser;
		const viewingUserIsSuper = authStore.isSuperuser;
		const isViewingOwnProfile = user?.id === authStore.user?.id;

		// Fetch pending caretaker requests for the viewed user (only when viewing another user)
		const { data: viewedUserPendingRequests } = usePendingCaretakerRequests(
			!isViewingOwnProfile && userId ? userId : null
		);

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

		const handleProjectClick = (projectId: number, event: React.MouseEvent) => {
			const url = `/projects/${projectId}/overview`;
			
			if (event.ctrlKey || event.metaKey) {
				window.open(url, "_blank");
			} else {
				onClose();
				navigate(url);
			}
		};

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
			pendingBecomeRequest?.primary_user?.id === user?.id;

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
			user.caretakers.some((c: ICaretakerSimpleUserData) => c.id === authStore.user?.id);

		// Check if there are ANY pending caretaker requests for this user
		const hasAnyPendingRequests = 
			viewedUserPendingRequests && viewedUserPendingRequests.length > 0;

		// Check if YOUR request is one of the pending requests
		const myPendingRequestForThisUser = viewedUserPendingRequests?.find(
			request => request.secondary_users?.[0]?.id === authStore.user?.id
		);

		// Disable button if: viewing own profile, user has caretaker, already caretaker, has OTHER pending requests, or not authorized
		const isBecomeCaretakerDisabled =
			isViewingOwnProfile || 
			userHasCaretaker || 
			isAlreadyCaretaker || 
			(hasAnyPendingRequests && !myPendingRequestForThisUser) || 
			!canBecomeCaretaker;

		const handleBecomeCaretaker = () => {
			// If you have a pending request for this user, show cancel dialog
			if (myPendingRequestForThisUser) {
				setShowCancelBecomeDialog(true);
			} else if (hasPendingBecomeRequest) {
				setShowCancelBecomeDialog(true);
			} else {
				setShowBecomeCaretakerDialog(true);
			}
		};

		const handleConfirmBecomeCaretaker = () => {
			if (!user?.id || !authStore.user?.id) return;

			becomeCaretakerMutation.mutate(
				{
					userId: user.id,
					caretakerId: authStore.user.id,
				},
				{
					onSuccess: () => {
						setShowBecomeCaretakerDialog(false);
					},
				},
			);
		};

		const handleConfirmCancelBecome = () => {
			// Use myPendingRequestForThisUser if available, otherwise use pendingBecomeRequest
			const requestToCancel = myPendingRequestForThisUser || pendingBecomeRequest;
			
			if (!requestToCancel?.id || !user?.id) return;

			cancelBecomeCaretakerMutation.mutate(
				{
					taskId: requestToCancel.id,
					userId: user.id,
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
										src={getImageUrl(user.image)}
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

							{/* Business Areas Led Section - Only show if user is a BA Lead */}
							{user.business_areas_led && user.business_areas_led.length > 0 && (
								<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
									<p className="font-bold text-sm mb-3 text-gray-600 dark:text-gray-300">
										Business Areas Led
									</p>
									<div className="space-y-3">
										{user.business_areas_led.map((ba, index) => {
											// Handle both ID format (from list) and object format (from detail)
											const baId = typeof ba === 'number' ? ba : ba.id;
											const baName = typeof ba === 'object' && ba.name ? ba.name : null;
											
											// Use shared image utility
											const baImage = typeof ba === 'object' && ba.image ? getImageUrl(ba.image) : null;
											
											const projectCount = typeof ba === 'object' && ba.project_count !== undefined ? ba.project_count : null;
											const divisionSlug = typeof ba === 'object' && ba.division && typeof ba.division === 'object' ? ba.division.slug : null;
											
											// Always use a stable key - prefer baId, fallback to index-based key
											const key = `ba-${baId ?? index}`;
											
											// If we only have ID, show minimal version
											if (!baName) {
												return (
													<div
														key={key}
														className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
													>
														<Badge className="bg-orange-600 text-white">
															BA Lead
														</Badge>
														<p className="ml-3 text-sm text-gray-600 dark:text-gray-300">
															Business Area ID: {baId}
														</p>
													</div>
												);
											}
											
											return (
												<div
													key={key}
													className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
												>
													{/* Business Area Image */}
													<div className="flex-shrink-0">
														{baImage ? (
															<img
																src={baImage}
																alt={baName}
																className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
																onError={(e) => {
																	// Hide the broken image and show placeholder instead
																	const parent = e.currentTarget.parentElement;
																	if (parent) {
																		e.currentTarget.style.display = 'none';
																		const placeholder = document.createElement('div');
																		placeholder.className = 'w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600';
																		placeholder.innerHTML = `<span class="text-2xl font-bold text-gray-400 dark:text-gray-500">${baName.charAt(0)}</span>`;
																		parent.appendChild(placeholder);
																	}
																}}
															/>
														) : (
															<div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
																<span className="text-2xl font-bold text-gray-400 dark:text-gray-500">
																	{baName.charAt(0)}
																</span>
															</div>
														)}
													</div>
													
													{/* Business Area Info */}
													<div className="flex-1 min-w-0">
														<div className="flex items-start justify-between gap-2">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2 mb-1">
																	<Badge className="bg-orange-600 text-white text-xs">
																		BA Lead
																	</Badge>
																	{divisionSlug && (
																		<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
																			[{divisionSlug}]
																		</span>
																	)}
																</div>
																<h4 className="font-bold text-base text-gray-900 dark:text-gray-100 truncate">
																	{baName}
																</h4>
																<div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
																	<span className="flex items-center gap-1">
																		<span className="font-medium">ID:</span>
																		<span>{baId}</span>
																	</span>
																	{projectCount !== null && (
																		<span className="flex items-center gap-1">
																			<span className="font-medium">Projects:</span>
																			<span className="font-semibold text-blue-600 dark:text-blue-400">
																				{projectCount}
																			</span>
																		</span>
																	)}
																</div>
															</div>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Involved Projects Section */}
							{involvedProjects && involvedProjects.length > 0 && (
								<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
									<p className="font-bold text-sm mb-3 text-gray-600 dark:text-gray-300">
										Involved Projects
									</p>
									{projectsLoading ? (
										<div className="space-y-2">
											<Skeleton className="h-16 w-full" />
											<Skeleton className="h-16 w-full" />
										</div>
									) : projectsError ? (
										<Alert variant="destructive">
											<AlertCircle className="size-4" />
											<AlertDescription>
												Failed to load projects
											</AlertDescription>
										</Alert>
									) : involvedProjects.length === 0 ? (
										<div className="text-center py-8 text-muted-foreground">
											<p className="text-sm">
												Not associated with any projects
											</p>
										</div>
									) : (
										<ProjectsDataTable
											projects={involvedProjects}
											columns={{
												title: true,
												image: true,
												kind: false,
												status: false,
												businessArea: false,
												role: true,
												createdAt: false,
											}}
											defaultSort="title"
											emptyMessage="Not associated with any projects"
											onProjectClick={handleProjectClick}
										/>
									)}
								</div>
							)}

							{/* Caretaker Section - Who is caretaking FOR this user */}
							<div className="border border-gray-300 dark:border-gray-500 rounded-xl p-4 mb-4 mt-2">
								<div className="flex items-center justify-between mb-3">
									<p className="font-bold text-sm text-gray-600 dark:text-gray-300">
										Caretaker
									</p>
									{user.id === authStore.user?.id && (
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
											.map((caretaker: ICaretakerSimpleUserData, index: number) => {
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
														key={`caretaker-${caretaker.id}-${index}`}
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
											{user.id === authStore.user?.id
												? "You don't have any caretakers assigned"
												: "This user doesn't have any caretakers assigned"}
										</p>
									</div>
								)}

								{/* Pending Caretaker Requests - Only show when viewing another user's profile */}
								{!isViewingOwnProfile && viewedUserPendingRequests && viewedUserPendingRequests.length > 0 && (
									<div className="mt-4 space-y-2">
										<p className="font-bold text-xs text-gray-600 dark:text-gray-300 mb-2">
											Pending Requests
										</p>
										{viewedUserPendingRequests
											.filter((request) => request.secondary_users?.[0])
											.map((request) => {
												const secondaryUser = request.secondary_users![0];
												// Transform image data to match UserDisplay expectations
												const userForDisplay = {
													...secondaryUser,
													image: getImageUrl(secondaryUser.image)
												};
												
												return (
													<div
														key={request.id}
														className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
													>
														<div className="flex-1 min-w-0">
															<UserDisplay
																user={userForDisplay}
																showEmail={false}
																size="sm"
															/>
															<p className="text-xs text-muted-foreground mt-1">
																Requested {format(new Date(request.created_at), "MMM d, yyyy")}
															</p>
															{request.end_date && (
																<p className="text-xs text-muted-foreground">
																	Until {format(new Date(request.end_date), "MMM d, yyyy")}
																</p>
															)}
														</div>
														<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
															Pending
														</Badge>
													</div>
												);
											})}
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
										{canBecomeCaretaker && (hasPendingBecomeRequest || myPendingRequestForThisUser) && (
											<p className="text-sm text-muted-foreground text-center">
												Your request has been made to become this user's caretaker
											</p>
										)}
										{canBecomeCaretaker && hasAnyPendingRequests && !hasPendingBecomeRequest && !myPendingRequestForThisUser && (
											<p className="text-sm text-muted-foreground text-center">
												This user already has a pending caretaker request
											</p>
										)}
										{canBecomeCaretaker && userHasCaretaker && !hasPendingBecomeRequest && !myPendingRequestForThisUser && (
											<p className="text-sm text-muted-foreground text-center">
												This user already has an active caretaker
											</p>
										)}
										{canBecomeCaretaker && isAlreadyCaretaker && (
											<p className="text-sm text-muted-foreground text-center">
												You are already this user's caretaker
											</p>
										)}
										{canBecomeCaretaker && (
											<Button
												onClick={handleBecomeCaretaker}
												disabled={
													isBecomeCaretakerDisabled &&
													!hasPendingBecomeRequest &&
													!myPendingRequestForThisUser
												}
												className={`w-full ${
													hasPendingBecomeRequest || myPendingRequestForThisUser
														? "bg-red-500 hover:bg-red-400 text-white"
														: "bg-green-500 hover:bg-green-400 text-white"
												} disabled:opacity-50 disabled:cursor-not-allowed`}
											>
												{becomeCaretakerMutation.isPending ||
												cancelBecomeCaretakerMutation.isPending ? (
													<>
														<Loader2 className="size-4 mr-2 animate-spin" />
														{hasPendingBecomeRequest || myPendingRequestForThisUser
															? "Cancelling..."
															: "Requesting..."}
													</>
												) : (hasPendingBecomeRequest || myPendingRequestForThisUser) ? (
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
											{user.id === authStore.user?.id && (
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
												.map((caretakee: ICaretakerSimpleUserData, index: number) => {
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
															key={`caretakee-${caretakee.id}-${index}`}
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
								user.id !== authStore.user?.id && (
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
									currentUserId={authStore.user.id!}
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
						<AlertDialogFooter className="mt-4">
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
