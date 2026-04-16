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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { useCreateAddress, useUpdateAddress } from "../../hooks/useAddresses";
import { useBranches } from "../../hooks/useBranches";
import type { IAddress } from "../../types/admin.types";

const addressSchema = z.object({
	branch: z.number({ error: "Branch is required" }),
	street: z.string().min(1, "Street is required"),
	zipcode: z.union([z.string().min(1, "Zip code is required"), z.number()]),
	city: z.string().min(1, "City is required"),
	state: z.string().min(1, "State is required"),
	country: z.string().min(1, "Country is required"),
	pobox: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	address?: IAddress;
}

export function AddressForm({ open, onOpenChange, address }: AddressFormProps) {
	const isEditing = !!address;
	const createMutation = useCreateAddress();
	const updateMutation = useUpdateAddress();
	const isPending = createMutation.isPending || updateMutation.isPending;
	const { data: branches = [] } = useBranches();

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		watch,
		formState: { errors },
	} = useForm<AddressFormData>({
		resolver: zodResolver(addressSchema),
		defaultValues: {
			branch: address?.branch ?? undefined,
			street: address?.street ?? "",
			zipcode: address?.zipcode ?? "",
			city: address?.city ?? "",
			state: address?.state ?? "WA",
			country: address?.country ?? "Australia",
			pobox: address?.pobox ?? "",
		},
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const selectedBranch = watch("branch");

	// Reset form when address changes or sheet opens
	useEffect(() => {
		if (open) {
			reset({
				branch: address?.branch ?? undefined,
				street: address?.street ?? "",
				zipcode: address?.zipcode ?? "",
				city: address?.city ?? "",
				state: address?.state ?? "WA",
				country: address?.country ?? "Australia",
				pobox: address?.pobox ?? "",
			});
		}
	}, [open, address, reset]);

	const handleBranchChange = (value: string) => {
		setValue("branch", Number(value), { shouldValidate: true });
	};

	const onSubmit = (data: AddressFormData) => {
		const payload = {
			branch: data.branch,
			street: data.street,
			zipcode: data.zipcode,
			city: data.city,
			state: data.state,
			country: data.country,
			pobox: data.pobox || undefined,
		};

		if (isEditing && address) {
			updateMutation.mutate(
				{ id: address.id, data: payload },
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
					<SheetTitle>{isEditing ? "Edit Address" : "Add Address"}</SheetTitle>
					<SheetDescription>
						{isEditing
							? "Update the address details below."
							: "Fill in the details to create a new address."}
					</SheetDescription>
				</SheetHeader>

				<form
					id="address-form"
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-6 px-4 py-4"
				>
					<div className="space-y-2">
						<Label htmlFor="address-branch">Branch</Label>
						<Select
							value={
								selectedBranch != null ? String(selectedBranch) : undefined
							}
							onValueChange={handleBranchChange}
						>
							<SelectTrigger id="address-branch">
								<SelectValue placeholder="Select a branch" />
							</SelectTrigger>
							<SelectContent>
								{branches.map((b) => (
									<SelectItem key={b.id} value={String(b.id)}>
										{b.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.branch && (
							<p className="text-sm text-destructive">
								{errors.branch.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="address-street">Street</Label>
						<Input
							id="address-street"
							autoComplete="off"
							placeholder="Enter street address"
							{...register("street")}
						/>
						{errors.street && (
							<p className="text-sm text-destructive">
								{errors.street.message}
							</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="address-zipcode">Zip Code</Label>
							<Input
								id="address-zipcode"
								autoComplete="off"
								placeholder="Enter zip code"
								{...register("zipcode")}
							/>
							{errors.zipcode && (
								<p className="text-sm text-destructive">
									{errors.zipcode.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="address-city">City</Label>
							<Input
								id="address-city"
								autoComplete="off"
								placeholder="Enter city"
								{...register("city")}
							/>
							{errors.city && (
								<p className="text-sm text-destructive">
									{errors.city.message}
								</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="address-state">State</Label>
							<Input
								id="address-state"
								autoComplete="off"
								placeholder="Enter state"
								{...register("state")}
							/>
							{errors.state && (
								<p className="text-sm text-destructive">
									{errors.state.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="address-country">Country</Label>
							<Input
								id="address-country"
								autoComplete="off"
								placeholder="Enter country"
								{...register("country")}
							/>
							{errors.country && (
								<p className="text-sm text-destructive">
									{errors.country.message}
								</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="address-pobox">PO Box</Label>
						<Input
							id="address-pobox"
							autoComplete="off"
							placeholder="Enter PO box (optional)"
							{...register("pobox")}
						/>
					</div>
				</form>

				<SheetFooter className="px-4">
					<Button
						type="submit"
						form="address-form"
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
