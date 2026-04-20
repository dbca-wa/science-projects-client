import { useEffect } from "react";
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	useCreateAffiliation,
	useUpdateAffiliation,
} from "../../hooks/useAffiliations";
import type { IAffiliation } from "../../types/admin.types";

const affiliationSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

type AffiliationFormData = z.infer<typeof affiliationSchema>;

interface AffiliationFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	affiliation?: IAffiliation;
}

export function AffiliationForm({
	open,
	onOpenChange,
	affiliation,
}: AffiliationFormProps) {
	const isEditing = !!affiliation;
	const createMutation = useCreateAffiliation();
	const updateMutation = useUpdateAffiliation();
	const isPending = createMutation.isPending || updateMutation.isPending;

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm<AffiliationFormData>({
		resolver: zodResolver(affiliationSchema),
		defaultValues: {
			name: affiliation?.name ?? "",
		},
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const nameValue = watch("name");

	// Reset form when affiliation changes or dialog/sheet opens
	useEffect(() => {
		if (open) {
			reset({
				name: affiliation?.name ?? "",
			});
		}
	}, [open, affiliation, reset]);

	const onSubmit = (data: AffiliationFormData) => {
		const payload = { name: data.name };

		if (isEditing && affiliation) {
			updateMutation.mutate(
				{ id: affiliation.id, data: payload },
				{ onSuccess: () => onOpenChange(false) }
			);
		} else {
			createMutation.mutate(payload, {
				onSuccess: () => onOpenChange(false),
			});
		}
	};

	const formContent = (
		<form
			id="affiliation-form"
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6"
		>
			<div className="space-y-2">
				<Label htmlFor="affiliation-name">Name</Label>
				<Input
					id="affiliation-name"
					autoFocus
					autoComplete="off"
					placeholder="Enter affiliation name"
					{...register("name")}
				/>
				{errors.name && (
					<p className="text-sm text-destructive">{errors.name.message}</p>
				)}
			</div>
		</form>
	);

	const submitButton = (
		<Button
			type="submit"
			form="affiliation-form"
			disabled={isPending || !nameValue?.trim()}
			className="w-full"
		>
			{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
			{isEditing ? "Update" : "Create"}
		</Button>
	);

	// Edit mode uses a Dialog (single field, more appropriate)
	if (isEditing) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Affiliation</DialogTitle>
						<DialogDescription>
							Update the affiliation details below.
						</DialogDescription>
					</DialogHeader>
					{formContent}
					<DialogFooter>{submitButton}</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	// Add mode uses a Sheet (consistent with other admin CRUDs)
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>Add Affiliation</SheetTitle>
					<SheetDescription>
						Fill in the details to create a new affiliation.
					</SheetDescription>
				</SheetHeader>
				<div className="px-4 py-4">{formContent}</div>
				<SheetFooter className="px-4">{submitButton}</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
