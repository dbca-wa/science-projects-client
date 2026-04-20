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
import { useCreateService, useUpdateService } from "../../hooks/useServices";
import type { IDepartmentalService } from "../../types/admin.types";

const serviceSchema = z.object({
	name: z.string().min(1, "Name is required"),
	director: z.number({ error: "Director is required" }),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	service?: IDepartmentalService;
}

export const ServiceForm = ({
	open,
	onOpenChange,
	service,
}: ServiceFormProps) => {
	const isEditing = !!service;
	const createMutation = useCreateService();
	const updateMutation = useUpdateService();
	const isPending = createMutation.isPending || updateMutation.isPending;

	const [directorPk, setDirectorPk] = useState<number | null>(
		service?.director ?? null
	);

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<ServiceFormData>({
		resolver: zodResolver(serviceSchema),
		defaultValues: {
			name: service?.name ?? "",
			director: service?.director ?? undefined,
		},
	});

	// Reset form when service changes or sheet opens
	useEffect(() => {
		if (open) {
			reset({
				name: service?.name ?? "",
				director: service?.director ?? undefined,
			});
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setDirectorPk(service?.director ?? null);
		}
	}, [open, service, reset]);

	const handleDirectorChange = (pk: number | null) => {
		setDirectorPk(pk);
		setValue("director", pk as number, { shouldValidate: true });
	};

	const onSubmit = (data: ServiceFormData) => {
		const payload = { name: data.name, director: data.director };

		if (isEditing && service) {
			updateMutation.mutate(
				{ id: service.id, data: payload },
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
			<SheetContent className="sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>{isEditing ? "Edit Service" : "Add Service"}</SheetTitle>
					<SheetDescription>
						{isEditing
							? "Update the service details below."
							: "Fill in the details to create a new service."}
					</SheetDescription>
				</SheetHeader>

				<form
					id="service-form"
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 px-4 py-4"
				>
					<div className="space-y-2">
						<Label htmlFor="service-name">Name</Label>
						<Input
							id="service-name"
							autoFocus
							autoComplete="off"
							placeholder="Enter service name"
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
							setUserFunction={handleDirectorChange}
							preselectedUserPk={directorPk ?? undefined}
							isEditable
							label="Executive Director"
							placeholder="Search for a user"
							helperText="The executive director of the service."
						/>
						{errors.director && (
							<p className="text-sm text-destructive">
								{errors.director.message}
							</p>
						)}
					</div>
				</form>

				<SheetFooter className="px-4">
					<Button
						type="submit"
						form="service-form"
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
};
