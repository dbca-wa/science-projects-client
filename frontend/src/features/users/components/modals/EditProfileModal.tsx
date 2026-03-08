import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { ImageUpload } from "@/shared/components/media";
import { FormRichTextEditor } from "@/shared/components/editor";
import { UnsavedChangesDialog } from "@/shared/components/editor/UnsavedChangesDialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
	image: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
	about: z.string().optional(),
	expertise: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: IUserData | IUserMe;
	onSuccess: () => void;
}

export const EditProfileModal = observer(
	({ isOpen, onClose, user }: EditProfileModalProps) => {
		// const queryClient = useQueryClient();
		const [isUnsavedDialogOpen, setIsUnsavedDialogOpen] = useState(false);
		const [_pendingClose, setPendingClose] = useState(false);

		const form = useForm<ProfileFormData>({
			resolver: zodResolver(profileSchema),
			defaultValues: {
				image: getImageUrl(user.image),
				about: user.about || "",
				expertise: user.expertise || "",
			},
		});

		const updateMutation = {
			isSuccess: false,
			isPending: false,
			mutate: (data: ProfileFormData) => console.log("Update:", data),
		};

		// Reset form when user data changes or modal opens
		React.useEffect(() => {
			if (isOpen) {
				form.reset({
					image: getImageUrl(user.image),
					about: user.about || "",
					expertise: user.expertise || "",
				});
				setPendingClose(false);
			}
		}, [isOpen, user.image, user.about, user.expertise, form]);

		// Block browser-level navigation when form is dirty

		useEffect(() => {
			const handleBeforeUnload = (e: BeforeUnloadEvent) => {
				if (form.formState.isDirty && isOpen && !updateMutation.isSuccess) {
					e.preventDefault();
					e.returnValue = "";
				}
			};

			window.addEventListener("beforeunload", handleBeforeUnload);
			return () =>
				window.removeEventListener("beforeunload", handleBeforeUnload);
		}, [form.formState.isDirty, isOpen, updateMutation.isSuccess]);

		const handleSubmit = (data: ProfileFormData) => {
			updateMutation.mutate(data);
		};

		const handleClose = () => {
			// Check if form has unsaved changes
			if (form.formState.isDirty && !updateMutation.isSuccess) {
				setPendingClose(true);
				setIsUnsavedDialogOpen(true);
			} else {
				form.reset();
				onClose();
			}
		};

		// Dialog handlers for unsaved changes
		const handleProceedClose = () => {
			setIsUnsavedDialogOpen(false);
			setPendingClose(false);
			form.reset(); // Reset form to mark as not dirty
			onClose();
		};

		const handleCancelClose = () => {
			setIsUnsavedDialogOpen(false);
			setPendingClose(false);
		};

		return (
			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Profile</DialogTitle>
						<DialogDescription>
							Update your profile image, about section, and expertise. This
							information will be displayed in-app and on your public profile.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-6"
						>
							{/* Image */}
							<FormField
								control={form.control}
								name="image"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Profile Image</FormLabel>
										<FormControl>
											<ImageUpload
												value={field.value}
												onChange={field.onChange}
												variant="avatar"
												allowUrl={true}
												disabled={updateMutation.isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* About */}
							<FormField
								control={form.control}
								name="about"
								render={({ field }) => (
									<FormItem>
										<FormLabel>About</FormLabel>
										<FormControl>
											<FormRichTextEditor
												value={field.value || ""}
												onChange={field.onChange}
												placeholder="Tell us about yourself..."
												toolbar="profile"
												disabled={updateMutation.isPending}
												wordLimit={500}
												aria-label="About"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Expertise */}
							<FormField
								control={form.control}
								name="expertise"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Expertise</FormLabel>
										<FormControl>
											<FormRichTextEditor
												value={field.value || ""}
												onChange={field.onChange}
												placeholder="Describe your areas of expertise..."
												toolbar="profile"
												disabled={updateMutation.isPending}
												wordLimit={500}
												aria-label="Expertise"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={handleClose}
									disabled={updateMutation.isPending}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={updateMutation.isPending}>
									{updateMutation.isPending && (
										<Loader2 className="mr-2 size-4 animate-spin" />
									)}
									Save Changes
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>

				<UnsavedChangesDialog
					isOpen={isUnsavedDialogOpen}
					onProceed={handleProceedClose}
					onCancel={handleCancelClose}
				/>
			</Dialog>
		);
	}
);
