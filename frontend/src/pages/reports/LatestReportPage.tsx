import { useNavigate } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useLatestReport } from "@/features/reports/hooks/useReports";
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
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { lazy, Suspense } from "react";

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

function TabSpinner() {
	return (
		<div className="flex justify-center py-12">
			<Loader2 className="size-8 animate-spin text-blue-600" />
		</div>
	);
}

interface LatestReportPageProps {
	selectedTab?: string;
}

function LatestReportPage({ selectedTab = "details" }: LatestReportPageProps) {
	const navigate = useNavigate();
	const { data: report, isLoading, error } = useLatestReport();

	const year = report?.year;
	const fyString = year
		? `FY ${String(year - 1).slice(2)}-${String(year).slice(2)}`
		: "Latest Report";

	useDocumentTitle(fyString);

	const handleTabChange = (value: string) => {
		const suffix = value === "details" ? "" : `/${value}`;
		navigate(`/reports/current${suffix}`);
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
					Failed to load report: {error.message || "Unknown error"}
				</AlertDescription>
			</Alert>
		);
	}

	if (!report) {
		return (
			<p className="text-center text-muted-foreground py-12">
				No report data available.
			</p>
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
				Annual Report ({fyString})
			</h1>

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
						<PendingTab />
					</Suspense>
				</TabsContent>
				<TabsContent value="approved">
					<Suspense fallback={<TabSpinner />}>
						<ApprovedTab />
					</Suspense>
				</TabsContent>
				<TabsContent value="preview">
					<Suspense fallback={<TabSpinner />}>
						<PrintPreviewTab report={report} />
					</Suspense>
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default LatestReportPage;
