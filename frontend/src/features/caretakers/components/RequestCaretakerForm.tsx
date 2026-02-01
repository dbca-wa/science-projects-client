import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { sanitizeFormData } from "@/shared/utils";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Calendar } from "@/shared/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
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
import { CalendarIcon, Loader2, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/app/stores/store-context";
import { useCaretakingChain } from "../hooks/useCaretakingChain";
import { useCaretakerCheck } from "../hooks/useCaretakerCheck";
import { CaretakerUserSearch } from "./CaretakerUserSearch";
import {
	useRequestCaretaker,
} from "../hooks/useRequestCaretaker";
import { useApproveCaretakerTask } from "../hooks/useApproveCaretakerTask";
import { caretakerKeys } from "../services/caretaker.endpoints";
import {
	caretakerRequestSchema,
	type CaretakerRequestFormData,
} from "../schemas/caretakerRequest.schema";
import type { IRequestCaretakerFormProps } from "../types/caretaker.types";

/**
 * RequestCaretakerForm component
 * Form for requesting a caretaker with validation and conditional field display
 *
 * Features:
 * - Reason dropdown (leave, resignation, other)
 * - Conditional end date picker (not for resignation)
 * - Conditional notes textarea (only for "other")
 * - User search with exclusion logic
 * - Form validation with Zod
 * - Confirmation modal before submitting
 * - Success/error handling
 *
 * @param userId - Current user ID
 * @param onSuccess - Callback on successful submission
 */
export const RequestCaretakerForm = ({
	userId,
	onSuccess,
}: IRequestCaretakerFormProps) => {
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [showApproveDialog, setShowApproveDialog] = useState(false);
	const [approveAsAdmin, setApproveAsAdmin] = useState(false);
	const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const authStore = useAuthStore();
	const isAdmin = authStore.user?.is_superuser || false;

	const queryClient = useQueryClient();
	const requestCaretakerMutation = useRequestCaretaker();
	const approveTaskMutation = useApproveCaretakerTask();

	// Get current user data to build caretaking chain
	const { data: currentUser } = useCurrentUser();

	// Get caretaker data to exclude users who requested you
	const { data: caretakerData } = useCaretakerCheck();

	// Build caretaking chain (current user + all caretakees + sub-caretakees)
	const caretakingChainIds = useCaretakingChain(currentUser);

	// Build ignore array: caretaking chain + users who requested you
	const ignoreArray = useMemo(() => {
		const ids = [...caretakingChainIds];
		
		// Add the primary user from become_caretaker_request_object (user who requested you)
		if (caretakerData?.become_caretaker_request_object?.primary_user?.id) {
			ids.push(caretakerData.become_caretaker_request_object.primary_user.id);
		}
		
		return ids;
	}, [caretakingChainIds, caretakerData?.become_caretaker_request_object?.primary_user?.id]);

	const form = useForm<CaretakerRequestFormData>({
		resolver: zodResolver(caretakerRequestSchema),
		defaultValues: {
			reason: undefined,
			endDate: null,
			notes: "",
			caretakerUserId: undefined,
		},
	});

	const watchedReason = form.watch("reason");
	const watchedCaretakerUserId = form.watch("caretakerUserId");
	const watchedEndDate = form.watch("endDate");
	const watchedNotes = form.watch("notes");

	// Check if form is valid based on current values
	const isFormValid = useMemo(() => {
		// Basic required fields
		if (!watchedReason || !watchedCaretakerUserId) {
			return false;
		}

		// End date required if not resignation
		if (watchedReason !== "resignation" && !watchedEndDate) {
			return false;
		}

		// Notes required if reason is "other"
		if (
			watchedReason === "other" &&
			(!watchedNotes || watchedNotes.trim() === "")
		) {
			return false;
		}

		return true;
	}, [watchedReason, watchedCaretakerUserId, watchedEndDate, watchedNotes]);

	const handleSubmit = (_data: CaretakerRequestFormData) => {
		setShowConfirmDialog(true);
	};

	const handleConfirm = () => {
		const data = form.getValues();
		
		// Sanitize form data before submission
		const sanitizedData = sanitizeFormData(data, ["notes"]);

		console.log("Submitting caretaker request with data:", sanitizedData);

		requestCaretakerMutation.mutate(
			{
				user_id: userId,
				caretaker_id: sanitizedData.caretakerUserId!,
				reason: sanitizedData.reason,
				end_date: sanitizedData.endDate
					? sanitizedData.endDate.toISOString().split("T")[0]
					: undefined,
				notes: sanitizedData.notes || undefined,
			},
			{
				onSuccess: (response) => {
					console.log(
						"Request created successfully. Response:",
						response,
					);
					console.log("Response task_id:", response.task_id);
					console.log("Is admin?", isAdmin);
					console.log("Approve as admin?", approveAsAdmin);

					setShowConfirmDialog(false);

					// If admin wants to approve immediately, show approval dialog
					if (isAdmin && approveAsAdmin && response.task_id) {
						console.log("Setting pending task ID to:", response.task_id);
						setPendingTaskId(response.task_id);
						setShowApproveDialog(true);
						// DO NOT invalidate queries yet - wait for admin decision
					} else {
						// Not approving as admin - invalidate queries to show pending request
						if (authStore.user?.id) {
							queryClient.invalidateQueries({
								queryKey: caretakerKeys.check(
									authStore.user.id,
								),
							});
						}
						form.reset();
						setApproveAsAdmin(false);
						onSuccess();
					}
				},
			},
		);
	};

	const handleApprove = () => {
		if (!pendingTaskId) {
			console.error("Cannot approve: pendingTaskId is null");
			return;
		}

		console.log("Approving task with ID:", pendingTaskId);

		approveTaskMutation.mutate(pendingTaskId, {
			onSuccess: () => {
				console.log("Task approved successfully");
				setShowApproveDialog(false);
				setPendingTaskId(null);
				form.reset();
				setApproveAsAdmin(false);

				// Invalidate queries to show the active caretaker
				if (authStore.user?.id) {
					queryClient.invalidateQueries({
						queryKey: caretakerKeys.check(authStore.user.id),
					});
				}

				onSuccess();
			},
			onError: (error: Error) => {
				console.error("Failed to approve task:", error);
			},
		});
	};

	return (
		<>
			<div className="space-y-6">
				<div>
					<h3 className="text-lg font-semibold mb-2">
						Request Caretaker
					</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Request someone to manage your projects during your
						absence. All caretaker requests require admin approval.
					</p>
				</div>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						{/* Reason Selection */}
						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Reason for Caretaker</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value || ""}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a reason" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="leave">
												On Leave
											</SelectItem>
											<SelectItem value="resignation">
												Leaving the Department
											</SelectItem>
											<SelectItem value="other">
												Other
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* End Date (conditional) */}
						{watchedReason && watchedReason !== "resignation" && (
							<FormField
								control={form.control}
								name="endDate"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>End Date</FormLabel>
										<Popover
											open={isCalendarOpen}
											onOpenChange={setIsCalendarOpen}
										>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant="outline"
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground",
														)}
													>
														{field.value ? (
															format(
																field.value,
																"PPP",
															)
														) : (
															<span>
																Pick an end date
															</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={
														field.value || undefined
													}
													onSelect={(date) => {
														field.onChange(date);
														setIsCalendarOpen(
															false,
														); // Close popover after selection
													}}
													disabled={(date: Date) =>
														date <= new Date()
													}
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Notes (conditional) */}
						{watchedReason === "other" && (
							<FormField
								control={form.control}
								name="notes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Notes</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Please explain the reason for requesting a caretaker..."
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Caretaker Selection */}
						<FormField
							control={form.control}
							name="caretakerUserId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Select Caretaker</FormLabel>
									<FormControl>
										<CaretakerUserSearch
											onSelect={field.onChange}
											excludeUserIds={ignoreArray} // Exclude current user + caretaking chain
										/>
									</FormControl>
									<p className="text-sm text-muted-foreground mt-2">
										Users you are caretaking for (and their
										caretakees) cannot be selected to
										prevent circular chains. Additionally,
										users who already have a caretaker
										cannot be selected.
									</p>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Error Display */}
						{requestCaretakerMutation.isError && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									{requestCaretakerMutation.error?.message ||
										"Failed to submit caretaker request"}
									{requestCaretakerMutation.error?.message?.includes(
										"user with a caretaker",
									) && (
										<p className="mt-2 text-sm">
											The selected user already has a
											caretaker assigned to them and
											cannot be a caretaker for others.
											Please select a different user.
										</p>
									)}
								</AlertDescription>
							</Alert>
						)}

						{/* Admin Approval Checkbox */}
						{isAdmin && (
							<div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
								<Checkbox
									id="approveAsAdmin"
									checked={approveAsAdmin}
									onCheckedChange={(checked) =>
										setApproveAsAdmin(checked as boolean)
									}
								/>
								<label
									htmlFor="approveAsAdmin"
									className="cursor-pointer select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
								>
									Approve as Admin
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Info className="h-4 w-4 text-muted-foreground cursor-help" />
											</TooltipTrigger>
											<TooltipContent>
												<p className="max-w-xs">
													As an admin, you can approve
													this caretaker request
													immediately after
													submission. If unchecked,
													the request will be pending
													and require approval later.
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</label>
							</div>
						)}

						{/* Submit Button */}
						<Button
							type="submit"
							disabled={
								!isFormValid ||
								requestCaretakerMutation.isPending
							}
							className="w-full"
						>
							{requestCaretakerMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting...
								</>
							) : (
								"Request Caretaker"
							)}
						</Button>
					</form>
				</Form>
			</div>

			{/* Confirmation Dialog */}
			<AlertDialog
				open={showConfirmDialog}
				onOpenChange={setShowConfirmDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Confirm Caretaker Request
						</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to request a caretaker?
							{isAdmin && approveAsAdmin ? (
								<span className="block mt-2 font-medium text-foreground">
									You will be prompted to approve this request
									immediately after submission.
								</span>
							) : (
								<span className="block mt-2">
									This will create a pending request that
									requires admin approval.
								</span>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							className="dark:text-black"
						>
							{requestCaretakerMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin " />
									Submitting...
								</>
							) : (
								"Confirm Request"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Admin Approval Dialog */}
			<AlertDialog
				open={showApproveDialog}
				onOpenChange={setShowApproveDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Approve Caretaker Request
						</AlertDialogTitle>
						<AlertDialogDescription>
							The caretaker request has been created successfully.
							<span className="block mt-2 font-medium text-foreground">
								Do you want to approve this request now as an
								admin?
							</span>
							<span className="block mt-2 text-sm">
								Approving will immediately assign the caretaker.
								If you cancel, the request will remain pending
								for later approval.
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setShowApproveDialog(false);
								setPendingTaskId(null);
								form.reset();
								setApproveAsAdmin(false);

								// Invalidate queries to show the pending request
								if (authStore.user?.id) {
									queryClient.invalidateQueries({
										queryKey: caretakerKeys.check(
											authStore.user.id,
										),
									});
								}

								onSuccess();
							}}
						>
							Leave Pending
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleApprove}
							className="bg-green-600 dark:hover:bg-green-800 hover:bg-green-700"
						>
							{approveTaskMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Approving...
								</>
							) : (
								"Approve Now"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
