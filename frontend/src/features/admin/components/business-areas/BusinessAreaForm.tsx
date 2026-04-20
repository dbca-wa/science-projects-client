import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/shared/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { UserSearchDropdown } from "@/shared/components/user/UserSearchDropdown";
import {
	useCreateBusinessArea,
	useUpdateBusinessArea,
} from "../../hooks/useBusinessAreas";
import { useDivisions } from "../../hooks/useDivisions";
import type { IBusinessArea } from "../../types/admin.types";

const businessAreaSchema = z.object({
	division: z.number({ error: "Division is required" }),
	name: z.string().min(1, "Name is required"),
	focus: z.string().optional().default(""),
	introduction: z.string().optional().default(""),
	image: z.any().optional(),
	leader: z.number().nullable().optional(),
	finance_admin: z.number().nullable().optional(),
	data_custodian: z.number().nullable().optional(),
});

type BusinessAreaFormData = z.infer<typeof businessAreaSchema>;

interface BusinessAreaFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	businessArea?: IBusinessArea;
}

export function BusinessAreaForm({
	open,
	onOpenChange,
	businessArea,
}: BusinessAreaFormProps) {
	const isEditing = !!businessArea;
	const createMutation = useCreateBusinessArea();
	const updateMutation = useUpdateBusinessArea();
	const isPending = createMutation.isPending || updateMutation.isPending;
	const { data: divisions = [] } = useDivisions();

	const [leaderPk, setLeaderPk] = useState<number | null>(null);
	const [financeAdminPk, setFinanceAdminPk] = useState<number | null>(null);
	const [dataCustodianPk, setDataCustodianPk] = useState<number | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		reset,
		control,
		formState: { errors },
	} = useForm<BusinessAreaFormData>({
		resolver: zodResolver(businessAreaSchema) as never,
		defaultValues: getDefaults(businessArea),
	});

	useEffect(() => {
		if (open) {
			reset(getDefaults(businessArea));
			const leaderVal =
				businessArea?.leader != null
					? typeof businessArea.leader === "object"
						? businessArea.leader.id
						: businessArea.leader
					: null;
			const faVal =
				businessArea?.finance_admin != null
					? typeof businessArea.finance_admin === "object"
						? businessArea.finance_admin.id
						: businessArea.finance_admin
					: null;
			const dcVal =
				businessArea?.data_custodian != null
					? typeof businessArea.data_custodian === "object"
						? businessArea.data_custodian.id
						: businessArea.data_custodian
					: null;
			// eslint-disable-next-line react-hooks/set-state-in-effect -- sync from props
			setLeaderPk(leaderVal);
			setFinanceAdminPk(faVal);
			setDataCustodianPk(dcVal);
			setImageFile(null);
		}
	}, [open, businessArea, reset]);

	const handleLeaderChange = (pk: number | null) => {
		setLeaderPk(pk);
		setValue("leader", pk, { shouldValidate: true });
	};

	const handleFinanceAdminChange = (pk: number | null) => {
		setFinanceAdminPk(pk);
		setValue("finance_admin", pk, { shouldValidate: true });
	};

	const handleDataCustodianChange = (pk: number | null) => {
		setDataCustodianPk(pk);
		setValue("data_custodian", pk, { shouldValidate: true });
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null;
		setImageFile(file);
		setValue("image", file, { shouldValidate: true });
	};

	const onSubmit = (data: BusinessAreaFormData) => {
		if (isEditing && businessArea?.id) {
			const payload = {
				is_active: businessArea.is_active,
				name: data.name,
				focus: data.focus ?? "",
				introduction: data.introduction ?? "",
				image: (() => {
					const img = imageFile ?? businessArea.image ?? null;
					return typeof img === "string" ? null : img;
				})() as File | null,
				division: divisions.find((d) => d.id === data.division),
				leader: data.leader ?? undefined,
				finance_admin: data.finance_admin ?? undefined,
				data_custodian: data.data_custodian ?? undefined,
			};
			updateMutation.mutate(
				{ id: businessArea.id, data: payload },
				{ onSuccess: () => onOpenChange(false) }
			);
		} else {
			const payload = {
				is_active: true,
				name: data.name,
				focus: data.focus ?? "",
				introduction: data.introduction ?? "",
				image: imageFile,
				division: data.division,
				leader: data.leader ?? undefined,
				finance_admin: data.finance_admin ?? undefined,
				data_custodian: data.data_custodian ?? undefined,
			};
			createMutation.mutate(payload, {
				onSuccess: () => onOpenChange(false),
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl" enableScrollIndicators>
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Business Area" : "Add Business Area"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Update the business area details below."
							: "Fill in the details to create a new business area."}
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[60vh] overflow-y-auto px-1" data-scrollable>
					<form
						id="business-area-form"
						onSubmit={handleSubmit(onSubmit as never)}
						className="space-y-6 py-4"
					>
						{/* Division */}
						<div className="space-y-2">
							<Label htmlFor="ba-division">
								Division <span className="text-destructive">*</span>
							</Label>
							<Controller
								name="division"
								control={control}
								render={({ field }) => (
									<Select
										value={field.value ? String(field.value) : undefined}
										onValueChange={(val) => field.onChange(Number(val))}
									>
										<SelectTrigger id="ba-division" className="w-full">
											<SelectValue placeholder="Select a division" />
										</SelectTrigger>
										<SelectContent>
											{divisions.map((div) => (
												<SelectItem key={div.id} value={String(div.id)}>
													{div.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.division && (
								<p className="text-sm text-destructive">
									{errors.division.message}
								</p>
							)}
						</div>

						{/* Name */}
						<div className="space-y-2">
							<Label htmlFor="ba-name">
								Name <span className="text-destructive">*</span>
							</Label>
							<Input
								id="ba-name"
								autoComplete="off"
								placeholder="Enter business area name"
								{...register("name")}
							/>
							{errors.name && (
								<p className="text-sm text-destructive">
									{errors.name.message}
								</p>
							)}
						</div>

						{/* Focus */}
						<div className="space-y-2">
							<Label htmlFor="ba-focus">Focus</Label>
							<Textarea
								id="ba-focus"
								placeholder="Enter focus description"
								rows={3}
								{...register("focus")}
							/>
						</div>

						{/* Introduction */}
						<div className="space-y-2">
							<Label htmlFor="ba-introduction">Introduction</Label>
							<Textarea
								id="ba-introduction"
								placeholder="Enter introduction"
								rows={3}
								{...register("introduction")}
							/>
						</div>

						{/* Image */}
						<div className="space-y-2">
							<Label htmlFor="ba-image">
								Image{" "}
								{!isEditing && <span className="text-destructive">*</span>}
							</Label>
							<Input
								id="ba-image"
								type="file"
								accept="image/*"
								onChange={handleImageChange}
							/>
							{!isEditing && !imageFile && (
								<p className="text-xs text-muted-foreground">
									An image is required when creating a business area.
								</p>
							)}
						</div>

						{/* Leader */}
						<div className="space-y-2">
							<UserSearchDropdown
								onlyInternal={false}
								isRequired={false}
								setUserFunction={handleLeaderChange}
								preselectedUserPk={leaderPk ?? undefined}
								isEditable
								label="Leader"
								placeholder="Search for a user"
								helperText="The leader of the business area (optional)."
							/>
						</div>

						{/* Finance Admin */}
						<div className="space-y-2">
							<UserSearchDropdown
								onlyInternal={false}
								isRequired={false}
								setUserFunction={handleFinanceAdminChange}
								preselectedUserPk={financeAdminPk ?? undefined}
								isEditable
								label="Finance Admin"
								placeholder="Search for a user"
								helperText="The finance administrator (optional)."
							/>
						</div>

						{/* Data Custodian */}
						<div className="space-y-2">
							<UserSearchDropdown
								onlyInternal={false}
								isRequired={false}
								setUserFunction={handleDataCustodianChange}
								preselectedUserPk={dataCustodianPk ?? undefined}
								isEditable
								label="Data Custodian"
								placeholder="Search for a user"
								helperText="The data custodian (optional)."
							/>
						</div>
					</form>
				</div>

				<DialogFooter>
					<Button
						type="submit"
						form="business-area-form"
						disabled={isPending}
						className="w-full sm:w-auto"
					>
						{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
						{isEditing ? "Update" : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** Extract default form values from an existing business area */
function getDefaults(ba?: IBusinessArea): BusinessAreaFormData {
	const divisionId =
		ba?.division != null
			? typeof ba.division === "object"
				? ba.division.id
				: ba.division
			: (undefined as unknown as number);

	const leaderVal =
		ba?.leader != null
			? typeof ba.leader === "object"
				? ba.leader.id
				: ba.leader
			: null;
	const faVal =
		ba?.finance_admin != null
			? typeof ba.finance_admin === "object"
				? ba.finance_admin.id
				: ba.finance_admin
			: null;
	const dcVal =
		ba?.data_custodian != null
			? typeof ba.data_custodian === "object"
				? ba.data_custodian.id
				: ba.data_custodian
			: null;

	return {
		division: divisionId,
		name: ba?.name ?? "",
		focus: ba?.focus ?? "",
		introduction: ba?.introduction ?? "",
		image: undefined,
		leader: leaderVal,
		finance_admin: faVal,
		data_custodian: dcVal,
	};
}
