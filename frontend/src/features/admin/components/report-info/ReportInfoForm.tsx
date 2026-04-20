import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
	useCreateReportInfo,
	useUpdateReportInfo,
} from "../../hooks/useReportInfo";
import { useDivisions } from "../../hooks/useDivisions";
import { useReportsForDivision } from "@/features/reports/hooks/useReports";
import type { IAnnualReport } from "@/features/reports/types/report.types";

const CURRENT_YEAR = new Date().getFullYear();

/* ── Schemas ── */
const createReportSchema = z.object({
	year: z.coerce
		.number({ error: "Year is required" })
		.int()
		.min(2013, "Year must be 2013 or later")
		.max(CURRENT_YEAR, `Year cannot be in the future (max ${CURRENT_YEAR})`),
	division: z.coerce
		.number({ error: "Division is required" })
		.min(1, "Division is required"),
});

type CreateReportFormData = z.infer<typeof createReportSchema>;

const editReportSchema = z.object({
	year: z.coerce
		.number({ error: "Year is required" })
		.int()
		.min(2013, "Year must be 2013 or later")
		.max(CURRENT_YEAR, `Year cannot be in the future (max ${CURRENT_YEAR})`),
	division: z.coerce.number().min(1, "Division is required"),
});

type EditReportFormData = z.infer<typeof editReportSchema>;

interface ReportInfoFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report?: IAnnualReport;
	defaultDivisionSlug?: string;
	lockDivision?: boolean;
}

export const ReportInfoForm = ({
	open,
	onOpenChange,
	report,
	defaultDivisionSlug,
	lockDivision,
}: ReportInfoFormProps) => {
	const isEditing = !!report;

	return isEditing ? (
		<EditReportInfoForm
			open={open}
			onOpenChange={onOpenChange}
			report={report}
			lockDivision={lockDivision}
		/>
	) : (
		<CreateReportInfoForm
			open={open}
			onOpenChange={onOpenChange}
			defaultDivisionSlug={defaultDivisionSlug}
			lockDivision={lockDivision}
		/>
	);
};

/* ── Create mode form ── */
const CreateReportInfoForm = ({
	open,
	onOpenChange,
	defaultDivisionSlug,
	lockDivision,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultDivisionSlug?: string;
	lockDivision?: boolean;
}) => {
	const createMutation = useCreateReportInfo();
	const { data: divisions } = useDivisions();
	const [backendError, setBackendError] = useState<string | null>(null);
	const [divisionValue, setDivisionValue] = useState<string>("");

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors, isValid },
	} = useForm<CreateReportFormData>({
		resolver: zodResolver(createReportSchema) as never,
		mode: "onChange",
		defaultValues: { year: CURRENT_YEAR, division: 0 },
	});

	// eslint-disable-next-line react-hooks/incompatible-library
	const watchedYear = watch("year");

	// Resolve the default division ID from slug
	const defaultDivId = useMemo(() => {
		if (!defaultDivisionSlug || !divisions) return undefined;
		return divisions.find((d) => d.slug === defaultDivisionSlug)?.id;
	}, [defaultDivisionSlug, divisions]);

	// Resolve the selected division slug for fetching existing years
	const selectedDivSlug = useMemo(() => {
		if (!divisions || !divisionValue) return undefined;
		return divisions.find((d) => d.id === Number(divisionValue))?.slug;
	}, [divisions, divisionValue]);

	// Fetch existing reports for the selected division to check year conflicts
	const { data: existingReports = [] } = useReportsForDivision(selectedDivSlug);
	const existingYears = useMemo(
		() => existingReports.map((r) => r.year),
		[existingReports]
	);

	// Check if the entered year already exists for this division
	const yearConflict = useMemo(() => {
		const y = Number(watchedYear);
		if (!y || isNaN(y)) return false;
		return existingYears.includes(y);
	}, [watchedYear, existingYears]);

	// Pre-select division from slug when modal opens
	useEffect(() => {
		if (open) {
			setBackendError(null);
			const divId = defaultDivId ?? 0;
			reset({ year: CURRENT_YEAR, division: divId });
			setDivisionValue(divId ? String(divId) : "");
		}
	}, [open, defaultDivId, reset]);

	const handleDivisionChange = (val: string) => {
		if (lockDivision) return;
		setDivisionValue(val);
		setValue("division", Number(val), { shouldValidate: true });
	};

	const onSubmit = (data: CreateReportFormData) => {
		if (yearConflict) return;
		setBackendError(null);
		createMutation.mutate(
			{ year: data.year, division: data.division },
			{
				onSuccess: () => onOpenChange(false),
				onError: (error: Error) => setBackendError(error.message),
			}
		);
	};

	const isDisabled = createMutation.isPending || !isValid || yearConflict;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Report Info</DialogTitle>
					<DialogDescription>
						Select a year and division to create a new annual report record.
					</DialogDescription>
				</DialogHeader>

				<form
					id="create-report-form"
					onSubmit={handleSubmit(onSubmit as never)}
					className="space-y-6 py-4"
				>
					{backendError && (
						<p className="text-sm text-destructive">{backendError}</p>
					)}

					{/* Year */}
					<div className="space-y-2">
						<Label htmlFor="cri-year">
							Year <span className="text-destructive">*</span>
						</Label>
						<Input
							id="cri-year"
							type="number"
							autoComplete="off"
							placeholder="e.g. 2025"
							{...register("year")}
						/>
						<p className="text-xs text-muted-foreground">
							The year for the report. e.g. type 2023 for financial year
							2022-2023. Submissions open 1 July and close 30 June of the report
							year by default.
						</p>
						{errors.year && (
							<p className="text-sm text-destructive">{errors.year.message}</p>
						)}
						{yearConflict && !errors.year && (
							<p className="text-sm text-destructive">
								A report for this year already exists for the selected division.
							</p>
						)}
					</div>

					{/* Division */}
					<div className="space-y-2">
						<Label htmlFor="cri-division">
							Division <span className="text-destructive">*</span>
						</Label>
						<Select
							value={divisionValue}
							onValueChange={handleDivisionChange}
							disabled={lockDivision}
						>
							<SelectTrigger id="cri-division" className="w-full">
								<SelectValue placeholder="Select a division" />
							</SelectTrigger>
							<SelectContent>
								{divisions?.map((div) => (
									<SelectItem key={div.id} value={String(div.id)}>
										{div.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{lockDivision && (
							<p className="text-xs text-muted-foreground">
								Division is locked to the currently selected division.
							</p>
						)}
						{errors.division && (
							<p className="text-sm text-destructive">
								{errors.division.message}
							</p>
						)}
					</div>
				</form>

				<DialogFooter>
					<Button
						type="submit"
						form="create-report-form"
						disabled={isDisabled}
						className="w-full sm:w-auto"
					>
						{createMutation.isPending && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

/* ── Edit mode form (year + division only) ── */
const EditReportInfoForm = ({
	open,
	onOpenChange,
	report,
	lockDivision,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: IAnnualReport;
	lockDivision?: boolean;
}) => {
	const updateMutation = useUpdateReportInfo();
	const { data: divisions } = useDivisions();
	const [divisionValue, setDivisionValue] = useState<string>("");

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isValid },
	} = useForm<EditReportFormData>({
		resolver: zodResolver(editReportSchema) as never,
		mode: "onChange",
		defaultValues: {
			year: report.year,
			division: report.division?.id ?? 0,
		},
	});

	useEffect(() => {
		if (open) {
			const divId = report.division?.id ?? 0;
			reset({ year: report.year, division: divId });
			// eslint-disable-next-line react-hooks/set-state-in-effect -- sync from props
			setDivisionValue(divId ? String(divId) : "");
		}
	}, [open, report, reset]);

	const handleDivisionChange = (val: string) => {
		if (lockDivision) return;
		setDivisionValue(val);
		setValue("division", Number(val), { shouldValidate: true });
	};

	const onSubmit = (data: EditReportFormData) => {
		updateMutation.mutate(
			{ id: report.id, data: { year: data.year, division: data.division } },
			{ onSuccess: () => onOpenChange(false) }
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Report Info</DialogTitle>
					<DialogDescription>
						Update the year and division for this annual report.
					</DialogDescription>
				</DialogHeader>

				<form
					id="edit-report-form"
					onSubmit={handleSubmit(onSubmit as never)}
					className="space-y-6 py-4"
				>
					{/* Year */}
					<div className="space-y-2">
						<Label htmlFor="eri-year">
							Year <span className="text-destructive">*</span>
						</Label>
						<Input
							id="eri-year"
							type="number"
							autoComplete="off"
							placeholder="e.g. 2025"
							{...register("year")}
						/>
						{errors.year && (
							<p className="text-sm text-destructive">{errors.year.message}</p>
						)}
					</div>

					{/* Division */}
					<div className="space-y-2">
						<Label htmlFor="eri-division">
							Division <span className="text-destructive">*</span>
						</Label>
						<Select
							value={divisionValue}
							onValueChange={handleDivisionChange}
							disabled={lockDivision}
						>
							<SelectTrigger id="eri-division" className="w-full">
								<SelectValue placeholder="Select a division" />
							</SelectTrigger>
							<SelectContent>
								{divisions?.map((div) => (
									<SelectItem key={div.id} value={String(div.id)}>
										{div.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{lockDivision && (
							<p className="text-xs text-muted-foreground">
								Division is locked to the currently selected division.
							</p>
						)}
						{errors.division && (
							<p className="text-sm text-destructive">
								{errors.division.message}
							</p>
						)}
					</div>
				</form>

				<DialogFooter>
					<Button
						type="submit"
						form="edit-report-form"
						disabled={updateMutation.isPending || !isValid}
						className="w-full sm:w-auto"
					>
						{updateMutation.isPending && (
							<Loader2 className="mr-2 size-4 animate-spin" />
						)}
						Update
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
