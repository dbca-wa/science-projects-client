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
import { useCreateDivision, useUpdateDivision } from "../../hooks/useDivisions";
import type { IDivision } from "../../types/admin.types";

const divisionSchema = z.object({
	name: z.string().min(1, "Name is required"),
	slug: z.string().min(1, "Slug is required"),
	director: z.number().nullable().optional(),
	approver: z.number().nullable().optional(),
});

type DivisionFormData = z.infer<typeof divisionSchema>;

interface DivisionFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	division?: IDivision;
}

export function DivisionForm({
	open,
	onOpenChange,
	division,
}: DivisionFormProps) {
	const isEditing = !!division;
	const createMutation = useCreateDivision();
	const updateMutation = useUpdateDivision();
	const isPending = createMutation.isPending || updateMutation.isPending;

	const [directorPk, setDirectorPk] = useState<number | null>(
		division?.director ?? null
	);
	const [approverPk, setApproverPk] = useState<number | null>(
		division?.approver ?? null
	);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<DivisionFormData>({
		resolver: zodResolver(divisionSchema),
		defaultValues: {
			name: division?.name ?? "",
			slug: division?.slug ?? "",
			director: division?.director ?? null,
			approver: division?.approver ?? null,
		},
	});

	// Reset form when division changes or sheet opens
	useEffect(() => {
		if (open) {
			reset({
				name: division?.name ?? "",
				slug: division?.slug ?? "",
				director: division?.director ?? null,
				approver: division?.approver ?? null,
			});
			setDirectorPk(division?.director ?? null);
			setApproverPk(division?.approver ?? null);
		}
	}, [open, division, reset]);

	const handleDirectorChange = (pk: number | null) => {
		setDirectorPk(pk);
		setValue("director", pk, { shouldValidate: true });
	};

	const handleApproverChange = (pk: number | null) => {
		setApproverPk(pk);
		setValue("approver", pk, { shouldValidate: true });
	};

	const onSubmit = (data: DivisionFormData) => {
		const payload = {
			name: data.name,
			slug: data.slug,
			director: data.director ?? null,
			approver: data.approver ?? null,
		};

		if (isEditing && division) {
			updateMutation.mutate(
				{ id: division.id, data: payload },
				{ onSuccess: () => onOpenChange(false) }
			);
		} else {
			createMutation.mutate(payload, {
				onSuccess: () => onOpenChange(false),
			});
		}
	};

	// eslint-disable-next-line react-hooks/incompatible-library
	const nameValue = watch("name");
	const slugValue = watch("slug");
	const canSubmit = !isPending && !!nameValue?.trim() && !!slugValue?.trim();

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-2xl">
				<SheetHeader>
					<SheetTitle>
						{isEditing ? "Edit Division" : "Add Division"}
					</SheetTitle>
					<SheetDescription>
						{isEditing
							? "Update the division details below."
							: "Fill in the details to create a new division."}
					</SheetDescription>
				</SheetHeader>

				<form
					id="division-form"
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 px-4 py-4"
				>
					<div className="space-y-2">
						<Label htmlFor="division-name">Name</Label>
						<Input
							id="division-name"
							autoFocus
							autoComplete="off"
							placeholder="Enter division name"
							{...register("name")}
						/>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="division-slug">Slug</Label>
						<Input
							id="division-slug"
							autoComplete="off"
							placeholder="Enter division slug"
							{...register("slug")}
						/>
						{errors.slug && (
							<p className="text-sm text-destructive">{errors.slug.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<UserSearchDropdown
							onlyInternal={false}
							isRequired={false}
							setUserFunction={handleDirectorChange}
							preselectedUserPk={directorPk ?? undefined}
							isEditable
							label="Director"
							placeholder="Search for a user"
							helperText="The director of the division (optional)."
						/>
					</div>

					<div className="space-y-2">
						<UserSearchDropdown
							onlyInternal={false}
							isRequired={false}
							setUserFunction={handleApproverChange}
							preselectedUserPk={approverPk ?? undefined}
							isEditable
							label="Approver"
							placeholder="Search for a user"
							helperText="The approver for the division (optional)."
						/>
					</div>
				</form>

				<SheetFooter className="px-4">
					<Button
						type="submit"
						form="division-form"
						disabled={!canSubmit}
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
