import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { useDivisions } from "../../hooks/useDivisions";
import { useCurrentUser } from "@/features/auth";
import { useAuthStore } from "@/app/stores/store-context";
import { useReportsForDivision } from "@/shared/hooks/queries/useReportsForDivision";

interface DivisionYearSafeguardProps {
	title: string;
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
	children,
}: DivisionYearSafeguardProps) => {
	const authStore = useAuthStore();
	const { data: currentUser } = useCurrentUser();
	const { data: allDivisions } = useDivisions();

	const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
	const [selectedYear, setSelectedYear] = useState<number | null>(null);

	// Filter divisions based on user role
	const availableDivisions = useMemo(() => {
		if (!allDivisions || !currentUser) return [];
		if (authStore.isSuperuser) return allDivisions;
		return allDivisions.filter((d) => d.key_stakeholder?.id === currentUser.id);
	}, [allDivisions, currentUser, authStore.isSuperuser]);

	// Auto-select if exactly one division
	useEffect(() => {
		if (availableDivisions.length === 1 && !selectedSlug) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- sync from data
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
			<div className="flex items-center gap-4">
				<h1 className="text-2xl font-bold">{title}</h1>
			</div>

			<div className="flex flex-wrap items-end gap-4">
				<div className="space-y-1">
					<label className="text-sm font-medium">Division</label>
					{availableDivisions.length <= 1 ? (
						<div className="h-11 flex items-center px-3 rounded-md border bg-muted text-sm">
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
							<SelectTrigger className="w-[220px]">
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

				<div className="space-y-1">
					<label className="text-sm font-medium">Year</label>
					{availableYears.length === 0 ? (
						<div className="h-11 flex items-center px-3 rounded-md border bg-muted text-sm text-muted-foreground">
							No reports available
						</div>
					) : (
						<Select
							value={selectedYear?.toString() ?? ""}
							onValueChange={(v) => setSelectedYear(Number(v))}
						>
							<SelectTrigger className="w-[160px]">
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
			</div>

			{isReady && selectedDivision && (
				<Alert>
					<AlertCircle className="size-4" />
					<AlertDescription>
						Operating on{" "}
						<span className="font-semibold">{selectedDivision.name}</span>
						{" — "}
						<span className="font-semibold">
							FY {String(selectedYear - 1).slice(2)}-
							{String(selectedYear).slice(2)}
						</span>
					</AlertDescription>
				</Alert>
			)}

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
		</div>
	);
};
