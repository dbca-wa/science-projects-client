import { useMemo, useState } from "react";
import { useLatestInactiveReports } from "@/features/reports/hooks/useReports";
import { useAuthStore } from "@/app/stores/store-context";
import { observer } from "mobx-react-lite";
import {
	Loader2,
	AlertCircle,
	BookOpen,
	FlaskConical,
	Bell,
	CheckCircle2,
	UserCheck,
	Building2,
	ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import {
	useBumpPreview,
	useSendBumpAll,
	useBatchApproveCurrent,
	useApproveAllPreview,
} from "@/shared/hooks/queries/useBumpEmails";
import { RecipientPreviewPanel } from "@/shared/components/layout/RecipientPreviewPanel";
import ReportProjectCard from "./ReportProjectCard";
import type {
	IARProgressReport,
	IARStudentReport,
} from "@/features/reports/types/report.types";

/** Classify a report into its current approval stage based on document flags. */
function getDocumentStage(
	report: IARProgressReport | IARStudentReport
): 1 | 2 | 3 {
	const doc = report.document;
	if (!doc.project_lead_approval_granted) return 1;
	if (!doc.business_area_lead_approval_granted) return 2;
	return 3;
}

interface PendingTabProps {
	reportId: number;
	divisionSlug?: string;
}

type StageTab = "pl" | "bal" | "final";

const STAGE_TABS: { value: StageTab; label: string; icon: typeof UserCheck }[] =
	[
		{ value: "pl", label: "PL Approval", icon: UserCheck },
		{ value: "bal", label: "BAL Approval", icon: Building2 },
		{ value: "final", label: "Final Approval", icon: ShieldCheck },
	];

const PendingTab = observer(function PendingTab({
	reportId,
	divisionSlug,
}: PendingTabProps) {
	const authStore = useAuthStore();
	const canEdit = authStore.isSuperuser || !!authStore.user?.is_key_stakeholder;
	const [activeTab, setActiveTab] = useState<StageTab>("final");

	const {
		data: inactiveData,
		isLoading,
		error,
	} = useLatestInactiveReports(reportId);

	const studentReports = useMemo(
		() => inactiveData?.student_reports ?? [],
		[inactiveData]
	);
	const progressReports = useMemo(
		() => inactiveData?.progress_reports ?? [],
		[inactiveData]
	);

	const staged = useMemo(() => {
		const s1P = progressReports.filter((r) => getDocumentStage(r) === 1);
		const s2P = progressReports.filter((r) => getDocumentStage(r) === 2);
		const s3P = progressReports.filter((r) => getDocumentStage(r) === 3);
		const s1S = studentReports.filter((r) => getDocumentStage(r) === 1);
		const s2S = studentReports.filter((r) => getDocumentStage(r) === 2);
		const s3S = studentReports.filter((r) => getDocumentStage(r) === 3);
		return {
			s1P,
			s2P,
			s3P,
			s1S,
			s2S,
			s3S,
			plCount: s1P.length + s1S.length,
			balCount: s2P.length + s2S.length,
			finalCount: s3P.length + s3S.length,
		};
	}, [progressReports, studentReports]);

	const counts: Record<StageTab, number> = {
		pl: staged.plCount,
		bal: staged.balCount,
		final: staged.finalCount,
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertDescription>
					Failed to load pending reports: {error.message}
				</AlertDescription>
			</Alert>
		);
	}

	if (studentReports.length === 0 && progressReports.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					There are no unapproved reports for this year.
				</p>
			</div>
		);
	}

	return (
		<div className="py-4 space-y-4">
			{/* Stage sub-tabs — pill-style row */}
			<div className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
				{STAGE_TABS.map(({ value, label, icon: Icon }) => {
					const isActive = activeTab === value;
					const count = counts[value];
					return (
						<button
							key={value}
							type="button"
							onClick={() => setActiveTab(value)}
							className={[
								"flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
								isActive
									? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
									: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
							].join(" ")}
						>
							<Icon className="size-4 shrink-0" />
							<span className="hidden sm:inline">{label}</span>
							<span
								className={[
									"inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold",
									isActive
										? count > 0
											? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
											: "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
										: "bg-gray-200/70 text-gray-500 dark:bg-gray-700/50 dark:text-gray-500",
								].join(" ")}
							>
								{count}
							</span>
						</button>
					);
				})}
			</div>

			{/* Tab content */}
			{activeTab === "pl" && (
				<BumpStagePanel
					progressReports={staged.s1P}
					studentReports={staged.s1S}
					canEdit={canEdit}
					stage={1}
					emptyMessage="No reports are awaiting project lead approval."
					reportId={reportId}
				/>
			)}
			{activeTab === "bal" && (
				<BumpStagePanel
					progressReports={staged.s2P}
					studentReports={staged.s2S}
					canEdit={canEdit}
					stage={2}
					emptyMessage="No reports are awaiting business area lead approval."
					reportId={reportId}
				/>
			)}
			{activeTab === "final" && (
				<FinalApprovalPanel
					progressReports={staged.s3P}
					studentReports={staged.s3S}
					canEdit={canEdit}
					divisionSlug={divisionSlug}
				/>
			)}
		</div>
	);
});

export default PendingTab;

/* ------------------------------------------------------------------ */
/*  Bump Stage Panel (PL / BAL tabs)                                   */
/* ------------------------------------------------------------------ */

interface BumpPreviewUser {
	user_id: number;
	name: string;
	email: string;
	as_project_lead_count: number;
	as_ba_lead_count: number;
	total: number;
}

interface BumpPreviewResponse {
	users: BumpPreviewUser[];
	total_users: number;
	total_documents: number;
}

function BumpStagePanel({
	progressReports,
	studentReports,
	canEdit,
	stage,
	emptyMessage,
	reportId,
}: {
	progressReports: IARProgressReport[];
	studentReports: IARStudentReport[];
	canEdit: boolean;
	stage: 1 | 2;
	emptyMessage: string;
	reportId: number;
}) {
	const [showBumpDialog, setShowBumpDialog] = useState(false);
	const [sendAggressive, setSendAggressive] = useState(false);
	const { data: bumpPreview, refetch } = useBumpPreview(
		showBumpDialog,
		stage,
		reportId
	);
	const sendBumpAll = useSendBumpAll();
	const totalCount = progressReports.length + studentReports.length;
	const bumpLabel = stage === 1 ? "Bump Project Leads" : "Bump BA Leads";

	return (
		<div className="space-y-4">
			{canEdit && totalCount > 0 && (
				<div className="flex justify-end">
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30"
						onClick={() => {
							setShowBumpDialog(true);
							refetch();
						}}
					>
						<Bell className="h-4 w-4" />
						{bumpLabel}
					</Button>
				</div>
			)}

			{totalCount === 0 ? (
				<div className="text-center py-8">
					<p className="text-muted-foreground">{emptyMessage}</p>
				</div>
			) : (
				<ReportAccordions
					progressReports={progressReports}
					studentReports={studentReports}
					canEdit={canEdit}
					showApproveButton={false}
				/>
			)}

			<BumpDialog
				open={showBumpDialog}
				onOpenChange={setShowBumpDialog}
				title={bumpLabel}
				description={
					stage === 1
						? "Send reminder emails to project leads with outstanding approvals."
						: "Send reminder emails to business area leads with outstanding approvals."
				}
				preview={bumpPreview}
				sendAggressive={sendAggressive}
				onSendAggressiveChange={setSendAggressive}
				onSend={() => {
					sendBumpAll.mutate(
						{ stage, report_id: reportId, send_aggressive: sendAggressive },
						{ onSuccess: () => setShowBumpDialog(false) }
					);
				}}
				isSending={sendBumpAll.isPending}
			/>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Final Approval Panel                                               */
/* ------------------------------------------------------------------ */

function FinalApprovalPanel({
	progressReports,
	studentReports,
	canEdit,
	divisionSlug,
}: {
	progressReports: IARProgressReport[];
	studentReports: IARStudentReport[];
	canEdit: boolean;
	divisionSlug?: string;
}) {
	const [showApproveDialog, setShowApproveDialog] = useState(false);
	const [sendNotifications, setSendNotifications] = useState(false);
	const batchApproveCurrent = useBatchApproveCurrent();
	const { data: recipientPreview } = useApproveAllPreview(
		sendNotifications && showApproveDialog,
		divisionSlug
	);
	const totalCount = progressReports.length + studentReports.length;

	return (
		<div className="space-y-4">
			{canEdit && totalCount > 0 && (
				<div className="flex justify-end">
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-950/30"
						onClick={() => setShowApproveDialog(true)}
					>
						<CheckCircle2 className="h-4 w-4" />
						Approve All ({totalCount})
					</Button>
				</div>
			)}

			{totalCount === 0 ? (
				<div className="text-center py-8">
					<p className="text-muted-foreground">
						No reports are awaiting final approval.
					</p>
				</div>
			) : (
				<ReportAccordions
					progressReports={progressReports}
					studentReports={studentReports}
					canEdit={canEdit}
					showApproveButton
				/>
			)}

			<Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Approve All Stage 3 Reports</DialogTitle>
						<DialogDescription>
							This will approve {totalCount} report
							{totalCount !== 1 ? "s" : ""} awaiting final approval for the
							current year.
						</DialogDescription>
					</DialogHeader>
					<div className="text-sm space-y-1 py-2">
						{progressReports.length > 0 && (
							<p>
								<span className="font-semibold">Progress reports: </span>
								{progressReports.length}
							</p>
						)}
						{studentReports.length > 0 && (
							<p>
								<span className="font-semibold">Student reports: </span>
								{studentReports.length}
							</p>
						)}
					</div>
					<div className="flex items-center gap-2 pt-2 border-t">
						<Checkbox
							id="send-notifications"
							checked={sendNotifications}
							onCheckedChange={(checked) =>
								setSendNotifications(checked === true)
							}
						/>
						<Label
							htmlFor="send-notifications"
							className="text-sm text-muted-foreground cursor-pointer"
						>
							Send approval notification emails
						</Label>
					</div>
					{sendNotifications && recipientPreview && (
						<RecipientPreviewPanel
							baLeads={recipientPreview.recipients.ba_leads}
							projectLeads={recipientPreview.recipients.project_leads}
							teamMembers={recipientPreview.recipients.team_members}
						/>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowApproveDialog(false)}
						>
							Cancel
						</Button>
						<Button
							className="bg-green-600 hover:bg-green-700 text-white"
							onClick={() => {
								batchApproveCurrent.mutate(
									{
										division: divisionSlug,
										send_notifications: sendNotifications,
									},
									{ onSuccess: () => setShowApproveDialog(false) }
								);
							}}
							disabled={batchApproveCurrent.isPending}
						>
							{batchApproveCurrent.isPending
								? "Approving..."
								: `Approve ${totalCount} Reports`}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Shared components                                                  */
/* ------------------------------------------------------------------ */

/** Reusable bump preview dialog */
function BumpDialog({
	open,
	onOpenChange,
	title,
	description,
	preview,
	sendAggressive,
	onSendAggressiveChange,
	onSend,
	isSending,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	preview: BumpPreviewResponse | undefined;
	sendAggressive: boolean;
	onSendAggressiveChange: (checked: boolean) => void;
	onSend: () => void;
	isSending: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{preview ? (
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground">
							{preview.total_users} user
							{preview.total_users !== 1 ? "s" : ""} will be bumped about{" "}
							{preview.total_documents} document
							{preview.total_documents !== 1 ? "s" : ""}.
						</p>
						<div className="space-y-2 max-h-60 overflow-y-auto">
							{preview.users.map((u) => (
								<div
									key={u.user_id}
									className="flex items-center justify-between rounded-md border p-2 text-sm"
								>
									<div>
										<p className="font-medium">{u.name}</p>
										<p className="text-xs text-muted-foreground">{u.email}</p>
									</div>
									<div className="text-right text-xs text-muted-foreground">
										{u.as_project_lead_count > 0 && (
											<p>{u.as_project_lead_count} as PL</p>
										)}
										{u.as_ba_lead_count > 0 && (
											<p>{u.as_ba_lead_count} as BAL</p>
										)}
									</div>
								</div>
							))}
						</div>
						<div className="flex items-center gap-2 pt-2 border-t">
							<Checkbox
								id="send-aggressive"
								checked={sendAggressive}
								onCheckedChange={(checked) =>
									onSendAggressiveChange(checked === true)
								}
							/>
							<Label
								htmlFor="send-aggressive"
								className="text-sm text-muted-foreground cursor-pointer"
							>
								Send individual emails per document
							</Label>
						</div>
					</div>
				) : (
					<div className="flex justify-center py-6">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						onClick={onSend}
						disabled={!preview?.total_users || isSending}
						className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
					>
						<Bell className="h-4 w-4" />
						{isSending
							? "Sending..."
							: `Bump ${preview?.total_users ?? 0} Users`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** Shared accordion layout for progress and student reports */
function ReportAccordions({
	progressReports,
	studentReports,
	canEdit,
	showApproveButton,
}: {
	progressReports: IARProgressReport[];
	studentReports: IARStudentReport[];
	canEdit: boolean;
	showApproveButton: boolean;
}) {
	return (
		<Accordion
			type="multiple"
			defaultValue={["student-reports", "progress-reports"]}
		>
			<div className="space-y-6">
				{studentReports.length > 0 && (
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
									{studentReports.length}
								</span>
							</span>
						</AccordionTrigger>
						<AccordionContent className="pt-4 px-1">
							<div className="space-y-6">
								{studentReports.map((sr, idx) => (
									<ReportProjectCard
										key={sr.id}
										report={sr}
										reportType="student"
										index={idx}
										canEdit={canEdit}
										showApproveButton={showApproveButton}
									/>
								))}
							</div>
						</AccordionContent>
					</AccordionItem>
				)}

				{progressReports.length > 0 && (
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
									{progressReports.length}
								</span>
							</span>
						</AccordionTrigger>
						<AccordionContent className="pt-4 px-1">
							<div className="space-y-6">
								{progressReports.map((pr, idx) => (
									<ReportProjectCard
										key={pr.id}
										report={pr}
										reportType="progress"
										index={idx}
										canEdit={canEdit}
										showApproveButton={showApproveButton}
									/>
								))}
							</div>
						</AccordionContent>
					</AccordionItem>
				)}
			</div>
		</Accordion>
	);
}
