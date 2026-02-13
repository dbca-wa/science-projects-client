import React from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { handleProfileUpdate } from "@/features/users/utils/profile-update.utils";
import { ImageUpload } from "@/shared/components/media";
import { RichTextEditor } from "@/shared/components/editor";
import { getImageUrl } from "@/shared/utils/image.utils";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/shared/components/PageTransition";

/**
 * ProfileEditPage
 *
 * Dedicated page for editing user profile (image, about, expertise).
 * Accessible at /users/me/profile
 */

const profileSchema = z.object({
	image: z.union([z.instanceof(File), z.string(), z.null()]).optional(),
	about: z.string().optional(),
	expertise: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileEditPage = observer(() => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: user, isLoading } = useCurrentUser();

	const form = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			image: user ? getImageUrl(user.image) : null,
			about: user?.about || "",
			expertise: user?.expertise || "",
		},
	});

	// Update form when user data loads
	React.useEffect(() => {
		if (user) {
			form.reset({
				image: getImageUrl(user.image),
				about: user.about || "",
				expertise: user.expertise || "",
			});
		}
	}, [user, form]);

	const updateMutation = useMutation({
		mutationFn: (data: ProfileFormData) =>
			handleProfileUpdate({
				userId: user!.id!,
				data,
				queryClient,
				hasExistingImage: !!user?.image,
			}),
		onSuccess: () => {
			toast.success("Profile updated successfully");
			navigate("/users/me");
		},
		onError: (error: Error) => {
			const message = error.message || "Failed to update profile";
			toast.error(message);
		},
	});

	const handleSubmit = (data: ProfileFormData) => {
		updateMutation.mutate(data);
	};

	const handleCancel = () => {
		navigate("/users/me");
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
					<div className="text-lg font-medium text-muted-foreground">
						Loading profile...
					</div>
				</div>
			</div>
		);
	}

	// Not found state
	if (!user) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">User not found</p>
			</div>
		);
	}

	return (
		<PageTransition>
			<div className="container max-w-4xl py-8">
				<Card>
					<CardHeader>
						<CardTitle>Edit Profile</CardTitle>
						<CardDescription>
							Update your profile image, about section, and expertise. This
							information will be visible to other users within the system.
							{user.is_staff && (
								<>
									{" "}
									It will also appear on your public staff profile when
									visibility is enabled.
								</>
							)}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(handleSubmit)}
								className="space-y-6"
							>
								{/* Profile Section Info */}
								{user.is_staff && (
									<div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
										<div className="flex items-start gap-3">
											<div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
												<svg
													className="w-3 h-3 text-white"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-blue-900 dark:text-blue-100">
													Public Profile Information
												</p>
												<p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
													This profile information will appear on the public
													staff directory when your profile visibility is
													enabled. You can control your public profile
													visibility in the "Public Profile" tab.
												</p>
											</div>
										</div>
									</div>
								)}

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
												<RichTextEditor
													value={field.value || ""}
													onChange={field.onChange}
													placeholder="Tell us about yourself..."
													toolbar="profile"
													disabled={updateMutation.isPending}
													minHeight="150px"
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
												<RichTextEditor
													value={field.value || ""}
													onChange={field.onChange}
													placeholder="Describe your areas of expertise..."
													toolbar="profile"
													disabled={updateMutation.isPending}
													minHeight="150px"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{/* Actions */}
								<div className="flex gap-4 justify-end pt-4 border-t">
									<Button
										type="button"
										variant="outline"
										onClick={handleCancel}
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
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</PageTransition>
	);
});

export default ProfileEditPage;
