import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { Loader2, RefreshCw, CheckSquare, Building, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useDivisions } from "@/shared/hooks/queries/useDivisions";
import { useCurrentUser } from "@/features/auth";
import { useAuthStore } from "@/app/stores/store-context";
import { useReportsForDivision } from "@/features/reports/hooks/useReports";
import { ReportInfoForm } from "@/features/admin/components/report-info/ReportInfoForm";
import { ARActionDialogs } from "@/shared/components/layout/ARActionDialogs";
import type { ARActionId } from "@/shared/components/layout/ManageDropdownContent";

/**
 * My Division view — shows AR actions scoped to the user's division(s).
 * Key stakeholders see only their divisions; superusers see all.
 */
export const MyDivisionView = observer(function MyDivisionView() {
	const authStore = useAuthStore();
	const { data: currentUser } = useCurrentUser();
	const { data: allDivisions, isLoading: divisionsLoading } = useDivisions();

	const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
	const [selectedYear, setSelectedYear] = useState<number | null>(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const availableDivisions = useMemo(() => {
		if (!allDivisions || !currentUser) return [];
		if (authStore.isSuperuser) return allDivisions;
		return allDivisions.filter((d) => d.key_stakeholder?.id === currentUser.id);
	}, [allDivisions, currentUser, authStore.isSuperuser]);

	useEffect(() => {
		if (availableDivisions.length > 0 && !selectedSlug) {
			setSelectedSlug(availableDivisions[0].slug);
		}
	}, [availableDivisions, selectedSlug]);

	const { data: divisionReports = [] } = useReportsForDivision(
		selectedSlug ?? undefined
	);

	const availableYears = useMemo(
		() => divisionReports.map((r) => r.year).sort((a, b) => b - a),
		[divisionReports]
	);

	useEffect(() => {
		if (availableYears.length > 0) {
			setSelectedYear(availableYears[0]);
		} else {
			setSelectedYear(null);
		}
	}, [availableYears]);

	const selectedDivision = useMemo(
		() => availableDivisions.find((d) => d.slug === selectedSlug) ?? null,
		[availableDivisions, selectedSlug]
	);

	const pageTitle = selectedDivision ? selectedDivision.name : "My Division";

	if (divisionsLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<Loader2 className="size-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (availableDivisions.length === 0) {
		return (
			<div className="text-center py-16">
				<Building className="mx-auto size-12 text-muted-foreground mb-4" />
				<p className="text-lg text-muted-foreground">No divisions available.</p>
				<p className="text-sm text-muted-foreground mt-1">
					You are not assigned as a key stakeholder for any division.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="w-full min-w-0 text-2xl font-bold text-gray-900 dark:text-gray-100 min-[1230px]:w-auto">
					{pageTitle}
				</h1>
				<div className="flex flex-1 flex-col gap-2">
					<div className="flex flex-wrap items-center gap-2">
						{availableDivisions.length > 1 && (
							<Select
								value={selectedSlug ?? ""}
								onValueChange={(slug) => {
									setSelectedSlug(slug);
									setSelectedYear(null);
								}}
							>
								<SelectTrigger className="min-w-[120px] flex-1">
									<SelectValue placeholder="Select division" />
								</SelectTrigger>
								<SelectContent>
									{availableDivisions.map((d) => (
										<SelectItem key={d.id} value={d.slug}>
											{d.slug}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						{availableYears.length > 0 && (
							<Select
								value={selectedYear?.toString() ?? ""}
								onValueChange={(v) => setSelectedYear(Number(v))}
							>
								<SelectTrigger className="min-w-[120px] flex-1">
									<SelectValue placeholder="Select year" />
								</SelectTrigger>
								<SelectContent>
									{availableYears.map((y) => (
										<SelectItem key={y} value={y.toString()}>
											FY {String(y - 1).slice(2)}-{String(y).slice(2)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						{selectedSlug && (
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										size="icon"
										className="hidden sm:inline-flex bg-green-600 hover:bg-green-500 text-white shrink-0"
										onClick={() => setCreateModalOpen(true)}
										aria-label="Create New Annual Report"
									>
										<Plus className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>Create New Annual Report</TooltipContent>
							</Tooltip>
						)}
					</div>
					{selectedSlug && (
						<Button
							className="w-full bg-green-600 hover:bg-green-500 text-white sm:hidden"
							onClick={() => setCreateModalOpen(true)}
							aria-label="Create New Annual Report"
						>
							<Plus className="size-4 mr-1.5" />
							<span className="xs:hidden">New Report</span>
							<span className="hidden xs:inline">New Annual Report</span>
						</Button>
					)}
				</div>
			</div>

			{selectedDivision && (
				<p className="text-sm text-muted-foreground">
					Managing annual reports for{" "}
					<span className="font-medium text-foreground">
						{selectedDivision.name}
					</span>
					{selectedYear && (
						<>
							{" — "}
							<span className="font-medium text-foreground">
								FY {String(selectedYear - 1).slice(2)}-
								{String(selectedYear).slice(2)}
							</span>
						</>
					)}
				</p>
			)}

			{selectedSlug && selectedYear ? (
				<ARActionCards
					divisionSlug={selectedSlug}
					year={selectedYear}
					divisionName={selectedDivision?.name ?? selectedSlug}
				/>
			) : (
				<p className="text-center py-8 text-muted-foreground">
					{!selectedSlug
						? "Select a division to view AR actions."
						: "No annual reports exist for this division yet."}
				</p>
			)}

			{selectedSlug && (
				<ReportInfoForm
					open={createModalOpen}
					onOpenChange={setCreateModalOpen}
					defaultDivisionSlug={selectedSlug}
					lockDivision={!authStore.isSuperuser}
				/>
			)}
		</div>
	);
});

/* ------------------------------------------------------------------ */
/*  AR Action Cards                                                    */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line react-refresh/only-export-components
const ARActionCards = ({
	divisionSlug,
	year,
	divisionName,
}: {
	divisionSlug: string;
	year: number;
	divisionName: string;
}) => {
	const navigate = useNavigate();
	const [arAction, setARAction] = useState<ARActionId | null>(null);

	const fyString = `FY ${String(year - 1).slice(2)}-${String(year).slice(2)}`;

	return (
		<div className="space-y-4">
			<button
				type="button"
				className="action-card action-card-primary flex w-full flex-col items-center text-center p-6 sm:flex-row sm:items-center sm:text-left sm:gap-5 sm:p-6 md:py-12"
				onClick={() => navigate("/manage/new-cycle")}
			>
				<div className="rounded-full bg-blue-50 dark:bg-blue-950/50 p-3 mb-3 sm:mb-0 shrink-0">
					<RefreshCw className="size-7 text-blue-600 dark:text-blue-400" />
				</div>
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Open New Cycle
					</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Create progress and student reports for {divisionName} ({fyString}).
					</p>
				</div>
			</button>

			<div className="flex justify-end">
				<div className="grid gap-4 md:grid-cols-2 w-full md:w-auto">
					<button
						type="button"
						className="action-card flex w-full flex-col items-center text-center p-6 sm:flex-row sm:items-center sm:text-left sm:gap-4"
						onClick={() => setARAction("batch-approve")}
					>
						<div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 shrink-0 mb-3 sm:mb-0">
							<CheckSquare className="size-6 text-green-500" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">
								Batch Approve
							</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								Approve all outstanding reports for {divisionName} ({fyString}).
							</p>
						</div>
					</button>

					<button
						type="button"
						className="action-card flex w-full flex-col items-center text-center p-6 sm:flex-row sm:items-center sm:text-left sm:gap-4"
						onClick={() => setARAction("batch-approve-old")}
					>
						<div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 shrink-0 mb-3 sm:mb-0">
							<CheckSquare className="size-6 text-blue-500" />
						</div>
						<div className="flex-1 min-w-0">
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">
								Batch Approve Old
							</h3>
							<p className="mt-1 text-sm text-muted-foreground">
								Approve all outstanding reports from previous years for{" "}
								{divisionName}.
							</p>
						</div>
					</button>
				</div>
			</div>

			<ARActionDialogs
				activeAction={arAction}
				onClose={() => setARAction(null)}
				divisionSlug={divisionSlug}
			/>
		</div>
	);
};
