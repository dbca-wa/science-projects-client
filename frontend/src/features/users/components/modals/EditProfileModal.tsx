import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IUserData, IUserMe } from "@/shared/types/user.types";
import { ImageUpload } from "@/shared/components/media";
import { FormRichTextEditor } from "@/shared/components/editor";
import { inlineEditStore } from "@/app/stores/InlineEditStore";
import { toast } from "sonner";
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
			}
		}, [isOpen, user.image, user.about, user.expertise, form]);

		// Register form dirty state with InlineEditStore for global NavigationBlocker
		useEffect(() => {
			const isDirty = form.formState.isDirty;
			if (isDirty && isOpen) {
				inlineEditStore.registerEditor({
					contentType: "edit-profile-modal" as never,
					entityId: user.id,
					originalContent: "clean",
					elementRef: null,
				});
				inlineEditStore.updateCurrentContent(
					"edit-profile-modal" as never,
					user.id,
					"dirty"
				);
			} else {
				inlineEditStore.unregisterEditor(
					"edit-profile-modal" as never,
					user.id
				);
			}
			return () => {
				inlineEditStore.unregisterEditor(
					"edit-profile-modal" as never,
					user.id
				);
			};
		}, [form.formState.isDirty, isOpen, user.id]);

		const handleSubmit = (data: ProfileFormData) => {
			updateMutation.mutate(data);
		};

		const handleClose = () => {
			if (form.formState.isDirty && !updateMutation.isSuccess) {
				toast.warning("You have unsaved changes", {
					description: "Save or discard your changes before closing.",
					duration: 3000,
				});
				return; // Prevent close
			}
			form.reset();
			onClose();
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
			</Dialog>
		);
	}
);
