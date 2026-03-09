/**
 * EditTeamMemberModal Component
 *
 * Modal for editing existing team member details.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useUpdateTeamMember } from "../../hooks/useUpdateTeamMember";
import type { IProjectMember } from "@/shared/types/project.types";

interface EditTeamMemberModalProps {
	member: IProjectMember;
	projectId: number;
	isOpen: boolean;
	onClose: () => void;
}

const editSchema = z.object({
	role: z
		.string()
		.min(1, "Role is required")
		.max(100, "Role must be 100 characters or less"),
	time_allocation: z
		.number()
		.min(0, "Time allocation must be between 0 and 100")
		.max(100, "Time allocation must be between 0 and 100")
		.int("Time allocation must be a whole number"),
	position: z
		.number()
		.positive("Position must be a positive number")
		.int("Position must be a whole number"),
});

type EditFormData = z.infer<typeof editSchema>;

export function EditTeamMemberModal({
	member,
	projectId,
	isOpen,
	onClose,
}: EditTeamMemberModalProps) {
	const { mutate: updateMember, isPending } = useUpdateTeamMember(projectId);

	const form = useForm<EditFormData>({
		resolver: zodResolver(editSchema),
		defaultValues: {
			role: member.role,
			time_allocation: member.time_allocation,
			position: member.position,
		},
	});

	const handleSubmit = (data: EditFormData) => {
		updateMember(
			{ userId: member.user.id, data },
			{
				onSuccess: () => {
					toast.success("Team member updated successfully");
					onClose();
				},
				onError: (error: Error) => {
					toast.error(error.message || "Failed to update team member");
				},
			}
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Team Member</DialogTitle>
					<DialogDescription>
						Update {member.user.display_first_name}'s role and involvement.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<FormControl>
										<Input {...field} placeholder="e.g., Lead Scientist" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="time_allocation"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Time Allocation (%)</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											min={0}
											max={100}
											onChange={(e) => field.onChange(parseInt(e.target.value))}
										/>
									</FormControl>
									<FormDescription>
										Percentage of time dedicated to this project (0-100)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="position"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Position</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											min={1}
											onChange={(e) => field.onChange(parseInt(e.target.value))}
										/>
									</FormControl>
									<FormDescription>
										Display order in the team list
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Saving..." : "Save Changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
