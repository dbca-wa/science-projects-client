import { useEffect, useMemo, useState } from "react";
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
import {
	useOpenNewCycle,
	useBatchApprove,
	useBatchApproveOld,
} from "@/features/admin/hooks/useAdminActions";
import { ReportInfoForm } from "@/features/admin/components/report-info/ReportInfoForm";

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

	// Filter divisions: superusers see all, KS sees only theirs
	const availableDivisions = useMemo(() => {
		if (!allDivisions || !currentUser) return [];
		if (authStore.isSuperuser) return allDivisions;
		return allDivisions.filter((d) => d.key_stakeholder?.id === currentUser.id);
	}, [allDivisions, currentUser, authStore.isSuperuser]);

	// Auto-select first division when available
	useEffect(() => {
		if (availableDivisions.length > 0 && !selectedSlug) {
			setSelectedSlug(availableDivisions[0].slug);
		}
	}, [availableDivisions, selectedSlug]);

	// Fetch reports for the selected division
	const { data: divisionReports = [] } = useReportsForDivision(
		selectedSlug ?? undefined
	);

	const availableYears = useMemo(
		() => divisionReports.map((r) => r.year).sort((a, b) => b - a),
		[divisionReports]
	);

	// Auto-select latest year when division changes
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

	// Title: show full division name when selected, otherwise "My Division"
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
						{/* Square icon button — visible on sm+ */}
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
					{/* Full-width labelled button — visible on mobile only */}
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

/** AR action cards for the selected division and year */
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
	const newCycleMutation = useOpenNewCycle();
	const batchApproveMutation = useBatchApprove();
	const batchApproveOldMutation = useBatchApproveOld();

	const fyString = `FY ${String(year - 1).slice(2)}-${String(year).slice(2)}`;

	return (
		<div className="space-y-4">
			{/* Batch approve cards */}
			<div className="grid gap-4 md:grid-cols-2">
				<ActionCard
					title="Batch Approve"
					description={`Approve all outstanding reports for ${divisionName} (${fyString}).`}
					icon={<CheckSquare className="size-6 text-green-500" />}
					isPending={batchApproveMutation.isPending}
					onAction={() => batchApproveMutation.mutate(divisionSlug)}
					confirmMessage={`This will batch approve all current reports for ${divisionName} (${fyString}). Continue?`}
				/>
				<ActionCard
					title="Batch Approve Old"
					description={`Approve all outstanding reports from previous years for ${divisionName}.`}
					icon={<CheckSquare className="size-6 text-blue-500" />}
					isPending={batchApproveOldMutation.isPending}
					onAction={() => batchApproveOldMutation.mutate(divisionSlug)}
					confirmMessage={`This will batch approve all older reports for ${divisionName}. Continue?`}
				/>
			</div>

			{/* Open New Cycle — prominent full-width clickable card */}
			<button
				type="button"
				className="action-card action-card-primary flex w-full flex-col items-center text-center p-6 sm:flex-row sm:items-center sm:text-left sm:gap-5 sm:p-6 md:py-12"
				disabled={newCycleMutation.isPending}
				onClick={() => {
					if (
						window.confirm(
							`This will open a new reporting cycle for ${divisionName} (${fyString}). Continue?`
						)
					) {
						newCycleMutation.mutate(divisionSlug);
					}
				}}
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
				{newCycleMutation.isPending && (
					<Loader2 className="mt-3 sm:mt-0 size-5 animate-spin text-muted-foreground shrink-0" />
				)}
			</button>
		</div>
	);
};

/** Single action card — the entire card is clickable */
// eslint-disable-next-line react-refresh/only-export-components
const ActionCard = ({
	title,
	description,
	icon,
	isPending,
	onAction,
	confirmMessage,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	isPending: boolean;
	onAction: () => void;
	confirmMessage: string;
}) => {
	const handleClick = () => {
		if (window.confirm(confirmMessage)) {
			onAction();
		}
	};

	return (
		<button
			type="button"
			className="action-card flex w-full flex-col items-center text-center p-6 sm:flex-row sm:items-center sm:text-left sm:gap-4"
			disabled={isPending}
			onClick={handleClick}
		>
			<div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 shrink-0 mb-3 sm:mb-0">
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="font-semibold text-gray-900 dark:text-gray-100">
					{title}
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			</div>
			{isPending && (
				<Loader2 className="mt-3 sm:mt-0 size-5 animate-spin text-muted-foreground shrink-0" />
			)}
		</button>
	);
};
