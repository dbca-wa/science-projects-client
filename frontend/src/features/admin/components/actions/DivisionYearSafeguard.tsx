import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
import { useDivisions } from "../../hooks/useDivisions";
import { useCurrentUser } from "@/features/auth";
import { useAuthStore } from "@/app/stores/store-context";
import { useReportsForDivision } from "@/shared/hooks/queries/useReportsForDivision";
import { ReportInfoForm } from "../report-info/ReportInfoForm";

interface DivisionYearSafeguardProps {
	title: string;
	/** Optional content rendered to the right of the division/year controls */
	headerRight?: React.ReactNode;
	children: (props: {
		divisionSlug: string;
		year: number;
		divisionName: string;
	}) => React.ReactNode;
}

/**
 * Wrapper that requires division + year selection before enabling AR actions.
 * Superusers see all divisions; key stakeholders see only their divisions.
 * Children render function only called when both are selected.
 */
export const DivisionYearSafeguard = ({
	title,
	headerRight,
	children,
}: DivisionYearSafeguardProps) => {
	const authStore = useAuthStore();
	const { data: currentUser } = useCurrentUser();
	const { data: allDivisions } = useDivisions();

	const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
	const [selectedYear, setSelectedYear] = useState<number | null>(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	// Filter divisions based on user role
	const availableDivisions = useMemo(() => {
		if (!allDivisions || !currentUser) return [];
		if (authStore.isSuperuser) return allDivisions;
		return allDivisions.filter((d) => d.key_stakeholder?.id === currentUser.id);
	}, [allDivisions, currentUser, authStore.isSuperuser]);

	// Auto-select first available division (defaults to first in list)
	useEffect(() => {
		if (availableDivisions.length > 0 && !selectedSlug) {
			// Prefer BCS if available, otherwise use the first division
			const bcs = availableDivisions.find(
				(d) => d.slug.toLowerCase() === "bcs"
			);
			// eslint-disable-next-line react-hooks/set-state-in-effect -- sync from data
			setSelectedSlug(bcs ? bcs.slug : availableDivisions[0].slug);
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

	// Reset year when division changes
	useEffect(() => {
		if (availableYears.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- sync from data
			setSelectedYear(availableYears[0]);
		} else {
			setSelectedYear(null);
		}
	}, [availableYears]);

	const selectedDivision = useMemo(
		() => availableDivisions.find((d) => d.slug === selectedSlug) ?? null,
		[availableDivisions, selectedSlug]
	);

	const isReady = !!selectedSlug && !!selectedYear;

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<h1 className="text-2xl font-bold">{title}</h1>

				<div className="flex flex-wrap items-center gap-3">
					<div>
						{availableDivisions.length <= 1 ? (
							<div className="h-9 flex items-center px-3 rounded-md border bg-muted text-sm">
								{selectedDivision?.name ?? "No divisions available"}
							</div>
						) : (
							<Select
								value={selectedSlug ?? ""}
								onValueChange={(slug) => {
									setSelectedSlug(slug);
									setSelectedYear(null);
								}}
							>
								<SelectTrigger
									className="w-[200px] h-9"
									aria-label="Select division"
								>
									<SelectValue placeholder="Select division" />
								</SelectTrigger>
								<SelectContent>
									{availableDivisions.map((d) => (
										<SelectItem key={d.id} value={d.slug}>
											{d.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					<div>
						{availableYears.length === 0 ? (
							<div className="h-9 flex items-center px-3 rounded-md border bg-muted text-sm text-muted-foreground">
								No reports
							</div>
						) : (
							<Select
								value={selectedYear?.toString() ?? ""}
								onValueChange={(v) => setSelectedYear(Number(v))}
							>
								<SelectTrigger
									className="w-[140px] h-9"
									aria-label="Select year"
								>
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
					</div>

					{selectedSlug && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									className="bg-green-600 hover:bg-green-500 text-white shrink-0"
									onClick={() => setCreateModalOpen(true)}
									aria-label="Create New Annual Report"
								>
									<Plus className="size-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Create New Annual Report</TooltipContent>
						</Tooltip>
					)}

					{headerRight}
				</div>
			</div>

			{isReady ? (
				children({
					divisionSlug: selectedSlug,
					year: selectedYear,
					divisionName: selectedDivision?.name ?? selectedSlug,
				})
			) : (
				<p className="text-center py-8 text-muted-foreground">
					Select a division and year above to proceed.
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
};
