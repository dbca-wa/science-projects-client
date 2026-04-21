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
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCreateLocation, useUpdateLocation } from "../../hooks/useLocations";
import type { ISimpleLocationData } from "../../types/admin.types";

const locationSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	location?: ISimpleLocationData;
}

export function LocationForm({
	open,
	onOpenChange,
	location,
}: LocationFormProps) {
	const isEditing = !!location;
	const createMutation = useCreateLocation();
	const updateMutation = useUpdateLocation();
	const isPending = createMutation.isPending || updateMutation.isPending;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<LocationFormData>({
		resolver: zodResolver(locationSchema),
		defaultValues: {
			name: location?.name ?? "",
		},
	});

	// Reset form when location changes or sheet opens
	useEffect(() => {
		if (open) {
			reset({
				name: location?.name ?? "",
			});
		}
	}, [open, location, reset]);

	const onSubmit = (data: LocationFormData) => {
		const payload = { name: data.name, area_type: location?.area_type ?? "" };

		if (isEditing && location) {
			updateMutation.mutate(
				{ id: location.id, data: payload },
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
					<SheetTitle>
						{isEditing ? "Edit Location" : "Add Location"}
					</SheetTitle>
					<SheetDescription>
						{isEditing
							? "Update the location details below."
							: "Fill in the details to create a new location."}
					</SheetDescription>
				</SheetHeader>

				<form
					id="location-form"
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 px-4 py-4"
				>
					<div className="space-y-2">
						<Label htmlFor="location-name">Name</Label>
						<Input
							id="location-name"
							autoFocus
							autoComplete="off"
							placeholder="Enter location name"
							{...register("name")}
						/>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name.message}</p>
						)}
					</div>
				</form>

				<SheetFooter className="px-4">
					<Button
						type="submit"
						form="location-form"
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
