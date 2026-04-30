import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/shared/services/api/client.service";
import { authKeys } from "@/features/auth/hooks/useAuth";
import type { IUserMe } from "@/shared/types/user.types";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Mail, Loader2 } from "lucide-react";

// Zod schema: valid email format, optional (empty string allowed)
const publicEmailSchema = z.object({
	public_email: z
		.string()
		.trim()
		.refine((val) => val === "" || z.string().email().safeParse(val).success, {
			message: "Please enter a valid email address",
		}),
	public_email_on: z.boolean(),
});

type PublicEmailFormData = z.infer<typeof publicEmailSchema>;

interface PublicEmailSectionProps {
	user: IUserMe;
}

/**
 * PublicEmailSection component
 * Allows staff to set a custom public email address and toggle it on/off.
 * When enabled, emails sent via the staff directory use this address
 * instead of the user's default email.
 */
export const PublicEmailSection = ({ user }: PublicEmailSectionProps) => {
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isDirty },
		control,
	} = useForm<PublicEmailFormData>({
		resolver: zodResolver(publicEmailSchema),
		defaultValues: {
			public_email: user.public_email ?? "",
			public_email_on: user.public_email_on ?? false,
		},
	});

	const publicEmailOn = useWatch({ control, name: "public_email_on" });

	const mutation = useMutation({
		mutationFn: (data: PublicEmailFormData) =>
			apiClient.put(`users/staffprofiles/${user.staff_profile_id}`, data),
		onSuccess: async () => {
			await queryClient.resetQueries({
				queryKey: authKeys.user(),
				exact: true,
			});
			toast.success("Public email settings saved");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save public email settings");
		},
	});

	const onSubmit = (data: PublicEmailFormData) => {
		mutation.mutate(data);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Mail className="size-5 text-muted-foreground" />
					<CardTitle>Public Email</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Email input */}
					<div className="space-y-2">
						<Label htmlFor="public-email">Email Address</Label>
						<Input
							id="public-email"
							type="email"
							placeholder="e.g. your.name@dbca.wa.gov.au"
							{...register("public_email")}
						/>
						{errors.public_email && (
							<p className="text-sm text-destructive">
								{errors.public_email.message}
							</p>
						)}
					</div>

					{/* Toggle switch */}
					<div className="flex items-center justify-between gap-4">
						<div className="space-y-0.5">
							<Label htmlFor="public-email-toggle">Enable Public Email</Label>
							<p className="text-sm text-muted-foreground">
								When enabled, emails sent via the staff directory will go to
								this address instead of your default email
							</p>
						</div>
						<Switch
							id="public-email-toggle"
							checked={publicEmailOn}
							onCheckedChange={(checked) =>
								setValue("public_email_on", checked, { shouldDirty: true })
							}
						/>
					</div>

					{/* Save button */}
					<div className="flex justify-end pt-2">
						<Button type="submit" disabled={mutation.isPending || !isDirty}>
							{mutation.isPending && (
								<Loader2 className="mr-2 size-4 animate-spin" />
							)}
							Save
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
