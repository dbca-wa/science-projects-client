import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
	SheetFooter,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { UserSearchDropdown } from "@/shared/components/user/UserSearchDropdown";
import { useCreateBranch, useUpdateBranch } from "../../hooks/useBranches";
import type { IBranch } from "../../types/admin.types";

const branchSchema = z.object({
	name: z.string().min(1, "Name is required"),
	manager: z.number({ error: "Manager is required" }),
});

type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	branch?: IBranch;
}

export function BranchForm({ open, onOpenChange, branch }: BranchFormProps) {
	const isEditing = !!branch;
	const createMutation = useCreateBranch();
	const updateMutation = useUpdateBranch();
	const isPending = createMutation.isPending || updateMutation.isPending;

	const [managerPk, setManagerPk] = useState<number | null>(
		branch?.manager?.id ?? null
	);

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<BranchFormData>({
		resolver: zodResolver(branchSchema),
		defaultValues: {
			name: branch?.name ?? "",
			manager: branch?.manager?.id ?? undefined,
		},
	});

	// Reset form when branch changes or sheet opens
	useEffect(() => {
		if (open) {
			reset({
				name: branch?.name ?? "",
				manager: branch?.manager?.id ?? undefined,
			});
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setManagerPk(branch?.manager?.id ?? null);
		}
	}, [open, branch, reset]);

	const handleManagerChange = (pk: number | null) => {
		setManagerPk(pk);
		if (pk !== null) {
			setValue("manager", pk, { shouldValidate: true });
		}
	};

	const onSubmit = (data: BranchFormData) => {
		const payload = { name: data.name, manager: data.manager };

		if (isEditing && branch) {
			updateMutation.mutate(
				{ id: branch.id, data: payload },
				{ onSuccess: () => onOpenChange(false) }
			);
		} else {
			createMutation.mutate(payload, {
				onSuccess: () => onOpenChange(false),
			});
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-2xl">
				<SheetHeader>
					<SheetTitle>{isEditing ? "Edit Branch" : "Add Branch"}</SheetTitle>
					<SheetDescription>
						{isEditing
							? "Update the branch details below."
							: "Fill in the details to create a new branch."}
					</SheetDescription>
				</SheetHeader>

				<form
					id="branch-form"
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 px-4 py-4"
				>
					<div className="space-y-2">
						<Label htmlFor="branch-name">Name</Label>
						<Input
							id="branch-name"
							autoFocus
							autoComplete="off"
							placeholder="Enter branch name"
							{...register("name")}
						/>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<UserSearchDropdown
							onlyInternal={false}
							isRequired
							setUserFunction={handleManagerChange}
							preselectedUserPk={managerPk ?? undefined}
							isEditable={isEditing}
							label="Manager"
							placeholder="Search for a user"
							helperText="The manager of the branch."
						/>
						{errors.manager && (
							<p className="text-sm text-destructive">
								{errors.manager.message}
							</p>
						)}
					</div>
				</form>

				<SheetFooter className="px-4">
					<Button
						type="submit"
						form="branch-form"
						disabled={isPending}
						className="w-full"
					>
						{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
						{isEditing ? "Update" : "Create"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
