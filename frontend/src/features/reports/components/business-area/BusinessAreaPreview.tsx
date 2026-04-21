import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, AlertCircle, BookOpen, FlaskConical } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ClickToEditBadge } from "@/shared/components/ClickToEditBadge";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { getImageUrl } from "@/shared/utils/image.utils";
import {
	useLatestProgressReports,
	useLatestStudentReports,
	useLatestReport,
} from "../../hooks/useReports";
import ReportProjectCard from "../current/ReportProjectCard";
import type {
	IBusinessArea,
	IBusinessAreaUser,
	IDivision,
} from "@/shared/types/org.types";
import type {
	IARProgressReport,
	IARStudentReport,
} from "../../types/report.types";

/**
 * Resolve the leader's display name from the nested leader object.
 * Returns "—" if no leader is available.
 */
function getLeaderName(leader: IBusinessArea["leader"]): string {
	if (!leader || typeof leader === "number") return "—";
	const user = leader as IBusinessAreaUser;
	const first = user.display_first_name;
	const last = user.display_last_name;
	if (first && last) return `${first} ${last}`;
	if (first) return first;
	if (last) return last;
	return "—";
}

interface BusinessAreaPreviewProps {
	area: IBusinessArea;
}

/**
 * Read-only preview of a business area matching the annual report chapter layout.
 *
 * Shows the banner image with title pill overlay, programme leader name,
 * introduction text, and approved projects for this business area.
 * An edit button appears on hover.
 */
export function BusinessAreaPreview({ area }: BusinessAreaPreviewProps) {
	const navigate = useNavigate();
	const [isHovered, setIsHovered] = useState(false);

	const imageUrl = getImageUrl(area.image);

	return (
		<div className="space-y-8">
			{/* Banner preview card — clickable block */}
			<div
				className="relative rounded-lg overflow-hidden bg-muted/30 pb-8 cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all"
				onClick={() => navigate("/reports/business-area/edit")}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<div className="absolute top-4 right-4 z-20">
					<ClickToEditBadge isVisible={isHovered} />
				</div>

				{/* Banner image with title pill overlay */}
				<div
					className="relative w-full overflow-hidden"
					style={{ aspectRatio: "210 / 78" }}
				>
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={`${area.name} banner`}
							className="absolute w-full"
							style={{
								top: "-6%",
								left: 0,
								height: "105%",
								objectFit: "cover",
								objectPosition: "center center",
							}}
						/>
					) : (
						<div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
							<span className="text-sm text-muted-foreground">No image</span>
						</div>
					)}

					{/* Title pill — matches .chapter_title_text_container from the annual report CSS */}
					<div
						className="absolute flex items-center"
						style={{
							width: "80%",
							height: "22.5%",
							bottom: "9.7%",
							right: 0,
							borderLeft: "3px solid #396494",
							borderTop: "3px solid #396494",
							borderBottom: "3px solid #396494",
							borderRight: "none",
							borderRadius: "30px 0 0 30px",
							backgroundColor: "rgba(255, 255, 255, 0.6)",
							paddingLeft: "16px",
						}}
					>
						<span
							className="text-lg font-bold leading-tight truncate md:text-2xl"
							style={{ color: "#000" }}
						>
							{area.name}
						</span>
					</div>
				</div>

				{/* Programme leader and introduction */}
				<div className="mt-8 px-12 relative">
					<p className="font-semibold">
						Programme Leader: {getLeaderName(area.leader)}
					</p>

					{area.introduction && area.introduction.trim() !== "" && (
						<div
							className="pt-8 prose dark:prose-invert max-w-none"
							dangerouslySetInnerHTML={{ __html: area.introduction }}
						/>
					)}
				</div>
			</div>

			{/* Approved projects for this business area */}
			<BusinessAreaApprovedProjects
				areaName={area.name}
				divisionSlug={
					area.division && typeof area.division === "object"
						? (area.division as IDivision).slug
						: undefined
				}
			/>
		</div>
	);
}

/**
 * Displays approved progress and student reports filtered to a specific business area.
 * Reuses the same Accordion layout and ReportProjectCard as ApprovedTab.
 */
function BusinessAreaApprovedProjects({
	areaName,
	divisionSlug,
}: {
	areaName: string;
	divisionSlug?: string;
}) {
	const { data: latestReport } = useLatestReport(divisionSlug);
	const reportId = latestReport?.id;

	const {
		data: progressReports,
		isLoading: progressLoading,
		error: progressError,
	} = useLatestProgressReports(reportId);
	const {
		data: studentReports,
		isLoading: studentLoading,
		error: studentError,
	} = useLatestStudentReports(reportId);

	const isLoading = progressLoading || studentLoading;
	const error = progressError || studentError;

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="size-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load approved reports: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	// Filter reports to only those belonging to this business area.
	// Defensive: business_area may be null, missing, or an unexpected shape (e.g. just an ID).
	const filteredProgress = (progressReports ?? []).filter(
		(r: IARProgressReport) => {
			const ba = r.document?.project?.business_area;
			return (
				ba != null &&
				typeof ba === "object" &&
				"name" in ba &&
				ba.name === areaName
			);
		}
	);
	const filteredStudents = (studentReports ?? []).filter(
		(r: IARStudentReport) => {
			const ba = r.document?.project?.business_area;
			return (
				ba != null &&
				typeof ba === "object" &&
				"name" in ba &&
				ba.name === areaName
			);
		}
	);

	if (filteredProgress.length === 0 && filteredStudents.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">
					No approved reports for this business area for the current annual
					report.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Accordion type="multiple" defaultValue={["progress-reports"]}>
				<div className="space-y-6">
					{filteredProgress.length > 0 && (
						<AccordionItem value="progress-reports" className="border-none">
							<AccordionTrigger
								className={[
									"rounded-full bg-gradient-to-r from-green-600 to-green-700",
									"text-white px-6 py-3 shadow-md cursor-pointer",
									"hover:from-green-500 hover:to-green-600 hover:no-underline",
									"transition-all duration-200",
									"[&[data-state=open]>svg]:rotate-180",
									"[&>svg]:text-white",
									"justify-center",
								].join(" ")}
							>
								<span className="flex items-center gap-3">
									<FlaskConical className="size-5" />
									<span className="font-bold text-lg">Progress Reports</span>
									<span className="bg-white/20 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
										{filteredProgress.length}
									</span>
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-4 px-1">
								<div className="space-y-6">
									{filteredProgress.map((pr, idx) => (
										<ReportProjectCard
											key={pr.id}
											report={pr}
											reportType="progress"
											index={idx}
											canEdit={false}
											showApproveButton={false}
										/>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					)}

					{filteredStudents.length > 0 && (
						<AccordionItem value="student-reports" className="border-none">
							<AccordionTrigger
								className={[
									"rounded-full bg-gradient-to-r from-blue-600 to-blue-700",
									"text-white px-6 py-3 shadow-md cursor-pointer",
									"hover:from-blue-500 hover:to-blue-600 hover:no-underline",
									"transition-all duration-200",
									"[&[data-state=open]>svg]:rotate-180",
									"[&>svg]:text-white",
									"justify-center",
								].join(" ")}
							>
								<span className="flex items-center gap-3">
									<BookOpen className="size-5" />
									<span className="font-bold text-lg">Student Reports</span>
									<span className="bg-white/20 text-white text-sm font-semibold px-2.5 py-0.5 rounded-full">
										{filteredStudents.length}
									</span>
								</span>
							</AccordionTrigger>
							<AccordionContent className="pt-4 px-1">
								<div className="space-y-6">
									{filteredStudents.map((sr, idx) => (
										<ReportProjectCard
											key={sr.id}
											report={sr}
											reportType="student"
											index={idx}
											canEdit={false}
											showApproveButton={false}
										/>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					)}
				</div>
			</Accordion>
		</div>
	);
}
