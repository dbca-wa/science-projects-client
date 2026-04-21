import { useNavigate } from "react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import {
	useReportsForDivision,
	useReportDetail,
} from "@/features/reports/hooks/useReports";
import { useDivisions } from "@/features/admin/hooks/useDivisions";
import { useCurrentUser } from "@/features/auth";
import {
	useAuthStore,
	useReportDetailsStore,
} from "@/app/stores/store-context";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@/shared/components/ui/tabs";
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
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { ReportInfoForm } from "@/features/admin/components/report-info/ReportInfoForm";

const DetailsTab = lazy(
	() => import("@/features/reports/components/current/DetailsTab")
);
const MediaTab = lazy(
	() => import("@/features/reports/components/current/MediaTab")
);
const PendingTab = lazy(
	() => import("@/features/reports/components/current/PendingTab")
);
const ApprovedTab = lazy(
	() => import("@/features/reports/components/current/ApprovedTab")
);
const PrintPreviewTab = lazy(
	() => import("@/features/reports/components/current/PrintPreviewTab")
);

const TABS = [
	{ value: "details", label: "Details" },
	{ value: "media", label: "Media" },
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "preview", label: "Print Preview" },
];

const TabSpinner = () => {
	return (
		<div className="flex justify-center py-12">
			<Loader2 className="size-8 animate-spin text-blue-600" />
		</div>
	);
};

interface LatestReportPageProps {
	selectedTab?: string;
}

/** Division slugs that grant AR admin access to key stakeholders */
const AR_ENABLED_DIVISION_SLUGS = ["BCS"];

const LatestReportPage = observer(function LatestReportPage({
	selectedTab = "details",
}: LatestReportPageProps) {
	const navigate = useNavigate();
	const authStore = useAuthStore();
	const reportDetailsStore = useReportDetailsStore();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const { data: divisions } = useDivisions();
	const { data: currentUser } = useCurrentUser();
	const selectedDivisionSlug = reportDetailsStore.state.selectedDivisionSlug;
	const selectedYear = reportDetailsStore.state.selectedYear;
	const {
		data: divisionReports = [],
		isLoading: listLoading,
		error: listError,
	} = useReportsForDivision(selectedDivisionSlug);

	// Find the selected report's ID from the lightweight list
	const selectedReportId = useMemo(() => {
		const found = divisionReports.find((r) => r.year === selectedYear);
		return found?.id ?? undefined;
	}, [divisionReports, selectedYear]);

	// Fetch full report detail (with dm, publications, etc.)
	const {
		data: report,
		isLoading: detailLoading,
		error: detailError,
	} = useReportDetail(selectedReportId);

	const isLoading = listLoading || detailLoading;
	const error = listError || detailError;

	// Available years sorted descending
	const availableYears = useMemo(
		() => divisionReports.map((r) => r.year).sort((a, b) => b - a),
		[divisionReports]
	);

	// Auto-select latest year when division changes
	useEffect(() => {
		if (availableYears.length > 0) {
			reportDetailsStore.setYear(availableYears[0]);
		} else {
			reportDetailsStore.setYear(null);
		}
	}, [availableYears, reportDetailsStore]);

	// Check if user can create a report for this division
	const canCreateReport = useMemo(() => {
		if (!currentUser || !divisions) return false;
		if (authStore.isSuperuser) return true;
		return divisions.some(
			(d) =>
				AR_ENABLED_DIVISION_SLUGS.includes(d.slug) &&
				d.slug === selectedDivisionSlug &&
				d.key_stakeholder?.id === currentUser.id
		);
	}, [currentUser, divisions, authStore.isSuperuser, selectedDivisionSlug]);

	const year = report?.year;
	const fyString = year
		? `FY ${String(year - 1).slice(2)}-${String(year).slice(2)}`
		: "";

	const titleText = fyString
		? `${selectedDivisionSlug} Annual Report (${fyString})`
		: `${selectedDivisionSlug} Annual Report`;

	useDocumentTitle(titleText);

	const handleTabChange = (value: string) => {
		const suffix = value === "details" ? "" : `/${value}`;
		navigate(`/reports/details${suffix}`);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[300px]">
				<Loader2 className="size-10 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load reports: {error.message || "Unknown error"}
				</AlertDescription>
			</Alert>
		);
	}

	// No report for this division/year
	if (!report) {
		return (
			<div className="space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						{selectedDivisionSlug} Annual Report
					</h1>

					<div className="flex items-center gap-2 shrink-0">
						{divisions && divisions.length > 0 && (
							<Select
								value={selectedDivisionSlug}
								onValueChange={(slug) =>
									reportDetailsStore.setDivisionSlug(slug)
								}
							>
								<SelectTrigger className="w-[120px]">
									<SelectValue placeholder="Select division" />
								</SelectTrigger>
								<SelectContent>
									{divisions.map((div) => (
										<SelectItem key={div.id} value={div.slug}>
											{div.slug}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						{canCreateReport && (
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

				<div className="flex flex-col items-center justify-center py-16 text-center">
					<p className="text-lg text-muted-foreground mb-2">
						No annual report exists for {selectedDivisionSlug} yet.
					</p>
					<p className="text-sm text-muted-foreground mb-6">
						An annual report needs to be created for this division before
						content can be added.
					</p>
					{canCreateReport && (
						<Button
							onClick={() => setCreateModalOpen(true)}
							className="bg-green-600 hover:bg-green-500 text-white"
						>
							<Plus className="mr-2 size-4" />
							Create Report Info
						</Button>
					)}
				</div>

				<ReportInfoForm
					open={createModalOpen}
					onOpenChange={setCreateModalOpen}
					defaultDivisionSlug={selectedDivisionSlug}
					lockDivision={!authStore.isSuperuser}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{selectedDivisionSlug} Annual Report ({fyString})
				</h1>

				<div className="flex items-center gap-2 shrink-0">
					{divisions && divisions.length > 0 && (
						<Select
							value={selectedDivisionSlug}
							onValueChange={(slug) => reportDetailsStore.setDivisionSlug(slug)}
						>
							<SelectTrigger className="w-[120px]">
								<SelectValue placeholder="Select division" />
							</SelectTrigger>
							<SelectContent>
								{divisions.map((div) => (
									<SelectItem key={div.id} value={div.slug}>
										{div.slug}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
					{availableYears.length > 0 && (
						<Select
							value={selectedYear?.toString() ?? ""}
							onValueChange={(v) => reportDetailsStore.setYear(Number(v))}
						>
							<SelectTrigger className="w-[120px]">
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
					{canCreateReport && (
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

			<Tabs value={selectedTab} onValueChange={handleTabChange}>
				{/* Desktop tabs */}
				<TabsList className="hidden w-full justify-start sm:inline-flex">
					{TABS.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.label}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Mobile select */}
				<div className="sm:hidden">
					<Select value={selectedTab} onValueChange={handleTabChange}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select a tab" />
						</SelectTrigger>
						<SelectContent>
							{TABS.map((tab) => (
								<SelectItem key={tab.value} value={tab.value}>
									{tab.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<TabsContent value="details">
					<Suspense fallback={<TabSpinner />}>
						<DetailsTab report={report} />
					</Suspense>
				</TabsContent>
				<TabsContent value="media">
					<Suspense fallback={<TabSpinner />}>
						<MediaTab report={report} />
					</Suspense>
				</TabsContent>
				<TabsContent value="pending">
					<Suspense fallback={<TabSpinner />}>
						<PendingTab reportId={report.id} />
					</Suspense>
				</TabsContent>
				<TabsContent value="approved">
					<Suspense fallback={<TabSpinner />}>
						<ApprovedTab reportId={report.id} />
					</Suspense>
				</TabsContent>
				<TabsContent value="preview">
					<Suspense fallback={<TabSpinner />}>
						<PrintPreviewTab report={report} />
					</Suspense>
				</TabsContent>
			</Tabs>

			<ReportInfoForm
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
				defaultDivisionSlug={selectedDivisionSlug}
				lockDivision={!authStore.isSuperuser}
			/>
		</div>
	);
});

export default LatestReportPage;
