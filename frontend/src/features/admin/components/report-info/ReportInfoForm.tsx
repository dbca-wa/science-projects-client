import { useEffect } from "react";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
	useCreateReportInfo,
	useUpdateReportInfo,
} from "../../hooks/useReportInfo";
import type { IAnnualReport } from "@/features/reports/types/report.types";

const reportInfoSchema = z.object({
	year: z.coerce
		.number({ error: "Year is required" })
		.int()
		.min(2000, "Year must be 2000 or later"),
	date_open: z.string().min(1, "Date open is required"),
	date_closed: z.string().min(1, "Date closed is required"),
	dm: z.string().optional().default(""),
	service_delivery_intro: z.string().optional().default(""),
	research_intro: z.string().optional().default(""),
	student_intro: z.string().optional().default(""),
	publications: z.string().optional().default(""),
});

type ReportInfoFormData = z.infer<typeof reportInfoSchema>;

interface ReportInfoFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report?: IAnnualReport;
}

export function ReportInfoForm({
	open,
	onOpenChange,
	report,
}: ReportInfoFormProps) {
	const isEditing = !!report;
	const createMutation = useCreateReportInfo();
	const updateMutation = useUpdateReportInfo();
	const isPending = createMutation.isPending || updateMutation.isPending;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ReportInfoFormData>({
		resolver: zodResolver(reportInfoSchema) as never,
		defaultValues: getDefaults(report),
	});

	useEffect(() => {
		if (open) {
			reset(getDefaults(report));
		}
	}, [open, report, reset]);

	const onSubmit = (data: ReportInfoFormData) => {
		const payload = {
			year: data.year,
			date_open: data.date_open,
			date_closed: data.date_closed,
			dm: data.dm || undefined,
			service_delivery_intro: data.service_delivery_intro || undefined,
			research_intro: data.research_intro || undefined,
			student_intro: data.student_intro || undefined,
			publications: data.publications || undefined,
		};

		if (isEditing && report) {
			updateMutation.mutate(
				{ id: report.id, data: payload },
				{ onSuccess: () => onOpenChange(false) }
			);
		} else {
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
						{isEditing ? "Edit Report Info" : "Create Report Info"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Update the annual report configuration below."
							: "Fill in the details to create a new annual report record."}
					</DialogDescription>
				</DialogHeader>

				<div className="max-h-[60vh] overflow-y-auto px-1" data-scrollable>
					<form
						id="report-info-form"
						onSubmit={handleSubmit(onSubmit as never)}
						className="space-y-6 py-4"
					>
						{/* Year */}
						<div className="space-y-2">
							<Label htmlFor="ri-year">
								Year <span className="text-destructive">*</span>
							</Label>
							<Input
								id="ri-year"
								type="number"
								autoComplete="off"
								placeholder="e.g. 2025"
								{...register("year")}
							/>
							{errors.year && (
								<p className="text-sm text-destructive">
									{errors.year.message}
								</p>
							)}
						</div>

						{/* Date Open */}
						<div className="space-y-2">
							<Label htmlFor="ri-date-open">
								Date Open <span className="text-destructive">*</span>
							</Label>
							<Input id="ri-date-open" type="date" {...register("date_open")} />
							{errors.date_open && (
								<p className="text-sm text-destructive">
									{errors.date_open.message}
								</p>
							)}
						</div>

						{/* Date Closed */}
						<div className="space-y-2">
							<Label htmlFor="ri-date-closed">
								Date Closed <span className="text-destructive">*</span>
							</Label>
							<Input
								id="ri-date-closed"
								type="date"
								{...register("date_closed")}
							/>
							{errors.date_closed && (
								<p className="text-sm text-destructive">
									{errors.date_closed.message}
								</p>
							)}
						</div>

						{/* DM */}
						<div className="space-y-2">
							<Label htmlFor="ri-dm">DM</Label>
							<Textarea
								id="ri-dm"
								placeholder="Director's message content"
								rows={3}
								{...register("dm")}
							/>
						</div>

						{/* Service Delivery Intro */}
						<div className="space-y-2">
							<Label htmlFor="ri-service-delivery">
								Service Delivery Intro
							</Label>
							<Textarea
								id="ri-service-delivery"
								placeholder="Service delivery introduction content"
								rows={3}
								{...register("service_delivery_intro")}
							/>
						</div>

						{/* Research Intro */}
						<div className="space-y-2">
							<Label htmlFor="ri-research">Research Intro</Label>
							<Textarea
								id="ri-research"
								placeholder="Research introduction content"
								rows={3}
								{...register("research_intro")}
							/>
						</div>

						{/* Student Intro */}
						<div className="space-y-2">
							<Label htmlFor="ri-student">Student Intro</Label>
							<Textarea
								id="ri-student"
								placeholder="Student introduction content"
								rows={3}
								{...register("student_intro")}
							/>
						</div>

						{/* Publications */}
						<div className="space-y-2">
							<Label htmlFor="ri-publications">Publications</Label>
							<Textarea
								id="ri-publications"
								placeholder="Publications content"
								rows={3}
								{...register("publications")}
							/>
						</div>
					</form>
				</div>

				<DialogFooter>
					<Button
						type="submit"
						form="report-info-form"
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

/** Extract default form values from an existing report */
function getDefaults(report?: IAnnualReport): ReportInfoFormData {
	return {
		year: report?.year ?? (new Date().getFullYear() as number),
		date_open: report?.date_open ?? "",
		date_closed: report?.date_closed ?? "",
		dm: report?.dm ?? "",
		service_delivery_intro: report?.service_delivery_intro ?? "",
		research_intro: report?.research_intro ?? "",
		student_intro: report?.student_intro ?? "",
		publications: report?.publications ?? "",
	};
}
