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
import { useDivisions } from "@/features/admin/hooks/useDivisions";
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
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{pageTitle}
				</h1>
				<div className="flex items-center gap-2">
					{availableDivisions.length > 1 && (
						<Select
							value={selectedSlug ?? ""}
							onValueChange={(slug) => {
								setSelectedSlug(slug);
								setSelectedYear(null);
							}}
						>
							<SelectTrigger className="w-[140px]">
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
							<SelectTrigger className="w-[140px]">
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
									className="bg-green-600 hover:bg-green-500 text-white"
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
		<div className="grid gap-4 md:grid-cols-3">
			<ActionCard
				title="Open New Cycle"
				description={`Create progress and student reports for ${divisionName} (${fyString}).`}
				icon={<RefreshCw className="size-6 text-orange-600" />}
				buttonLabel="Open New Cycle"
				isPending={newCycleMutation.isPending}
				onAction={() => newCycleMutation.mutate(divisionSlug)}
				confirmMessage={`This will open a new reporting cycle for ${divisionName} (${fyString}). Continue?`}
			/>
			<ActionCard
				title="Batch Approve"
				description={`Approve all outstanding reports for ${divisionName} (${fyString}).`}
				icon={<CheckSquare className="size-6 text-green-600" />}
				buttonLabel="Batch Approve"
				isPending={batchApproveMutation.isPending}
				onAction={() => batchApproveMutation.mutate(divisionSlug)}
				confirmMessage={`This will batch approve all current reports for ${divisionName} (${fyString}). Continue?`}
			/>
			<ActionCard
				title="Batch Approve Old"
				description={`Approve all outstanding reports from previous years for ${divisionName}.`}
				icon={<CheckSquare className="size-6 text-blue-600" />}
				buttonLabel="Batch Approve Old"
				isPending={batchApproveOldMutation.isPending}
				onAction={() => batchApproveOldMutation.mutate(divisionSlug)}
				confirmMessage={`This will batch approve all older reports for ${divisionName}. Continue?`}
			/>
		</div>
	);
};

/** Single action card with confirmation */
// eslint-disable-next-line react-refresh/only-export-components
const ActionCard = ({
	title,
	description,
	icon,
	buttonLabel,
	isPending,
	onAction,
	confirmMessage,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	buttonLabel: string;
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
		<div className="rounded-lg border bg-card p-5 space-y-3">
			<div className="flex items-center gap-3">
				{icon}
				<h3 className="font-semibold text-gray-900 dark:text-gray-100">
					{title}
				</h3>
			</div>
			<p className="text-sm text-muted-foreground">{description}</p>
			<Button
				onClick={handleClick}
				disabled={isPending}
				variant="default"
				className="w-full"
			>
				{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
				{buttonLabel}
			</Button>
		</div>
	);
};
