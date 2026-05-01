import { useParams, useNavigate, useLocation } from "react-router";
import { useEffect, useState, useMemo } from "react";
import { useProject } from "@/features/projects/hooks/useProject";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { useCaretakerPermissions } from "@/features/caretakers/hooks/useCaretakerPermissions";
import { useCurrentUser } from "@/features/auth";
import { isCaretakerOfAdmin } from "@/features/projects/utils/caretaker-admin.utils";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { sanitizeInput } from "@/shared/utils/sanitise.utils";
import type { IUserData } from "@/shared/types/user.types";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { NavigationButton } from "@/shared/components/navigation/NavigationButton";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, ArrowLeft, Mail, Loader2 } from "lucide-react";
import { DeletionRequestBanner } from "@/features/projects/components/overview/DeletionRequestBanner";
import { DeleteProjectModal } from "@/features/projects/components/modals/DeleteProjectModal";
import { useCancelDeletionRequest } from "@/features/projects/hooks/useCancelDeletionRequest";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { OverviewTab } from "@/features/projects/components/tabs/OverviewTab";
import { ConceptPlanTab } from "@/features/projects/components/tabs/ConceptPlanTab";
import { ProjectPlanTab } from "@/features/projects/components/tabs/ProjectPlanTab";
import { ProgressReportsTab } from "@/features/projects/components/tabs/ProgressReportsTab";
import { StudentReportsTab } from "@/features/projects/components/tabs/StudentReportsTab";
import { ProjectClosureTab } from "@/features/projects/components/tabs/ProjectClosureTab";
import { useConfetti } from "@/shared/hooks/effects/useConfetti";
import { PageTransition } from "@/shared/components/PageTransition";

interface ProjectDetailPageProps {
	selectedTab?: string;
}

export default function ProjectDetailPage({
	selectedTab = "overview",
}: ProjectDetailPageProps) {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { data, isLoading, error } = useProject(id);
	const { fireConfetti } = useConfetti();
	const [hasShownConfetti, setHasShownConfetti] = useState(false);

	// Dynamic document title based on project name
	const projectTitle = data?.project?.title
		? sanitizeInput(data.project.title)
		: "Project";
	useDocumentTitle(projectTitle);

	// ALWAYS call these hooks - they must be called unconditionally
	const { data: currentUser } = useCurrentUser();
	const caretakerPerms = useCaretakerPermissions();

	// ALWAYS call useUserDetail hooks - pass undefined when data doesn't exist
	const { data: conceptPlanCreator } = useUserDetail(
		data?.documents?.concept_plan?.document.creator
	);
	const { data: conceptPlanModifier } = useUserDetail(
		data?.documents?.concept_plan?.document.modifier
	);

	const { data: projectPlanCreator } = useUserDetail(
		data?.documents?.project_plan?.document.creator
	);
	const { data: projectPlanModifier } = useUserDetail(
		data?.documents?.project_plan?.document.modifier
	);

	const { data: projectClosureCreator } = useUserDetail(
		data?.documents?.project_closure?.document.creator
	);
	const { data: projectClosureModifier } = useUserDetail(
		data?.documents?.project_closure?.document.modifier
	);

	// ALWAYS call useMemo hooks
	// eslint-disable-next-line react-hooks/preserve-manual-memoization -- React Compiler optimisation hint
	const userIsCaretakerOfProjectLeader = useMemo(() => {
		if (!data?.project) return false;
		return caretakerPerms.canActAsProjectLead(data.project);
	}, [caretakerPerms, data?.project]);

	// eslint-disable-next-line react-hooks/preserve-manual-memoization -- React Compiler optimisation hint
	const userIsCaretakerOfBaLeader = useMemo(() => {
		if (!data?.project?.business_area) return false;
		return caretakerPerms.canActAsBusinessAreaLead(data.project.business_area);
	}, [caretakerPerms, data?.project]);

	const userIsCaretakerOfAdmin = useMemo(() => {
		return isCaretakerOfAdmin(
			currentUser,
			data?.members as Array<{ user: IUserData }> | null,
			caretakerPerms.canActForUser
		);
	}, [currentUser, data?.members, caretakerPerms]);

	// eslint-disable-next-line react-hooks/preserve-manual-memoization -- React Compiler optimisation hint
	const isBaLead = useMemo(() => {
		if (!currentUser || !data?.project?.business_area?.leader) return false;
		return currentUser.id === data.project.business_area.leader;
	}, [currentUser, data?.project]);

	// Deletion banner state and hooks
	const [isDeletionBannerDeleteOpen, setIsDeletionBannerDeleteOpen] =
		useState(false);
	const cancelDeletionMutation = useCancelDeletionRequest(Number(id) || 0);

	const handleBannerDeleteProject = () => setIsDeletionBannerDeleteOpen(true);
	const handleBannerCancelRequest = () => {
		if (data?.project?.deletion_request_id) {
			cancelDeletionMutation.mutate(data.project.deletion_request_id);
		}
	};

	// ALWAYS call useEffect
	useEffect(() => {
		const state = location.state as { showSuccessAnimation?: boolean } | null;
		const searchParams = new URLSearchParams(location.search);
		const testConfetti = searchParams.get("confetti") === "true";

		// Check sessionStorage to prevent re-trigger on page refresh
		const confettiShownKey = `confetti-shown-${id}`;
		const alreadyShown = sessionStorage.getItem(confettiShownKey) === "true";

		if (
			(state?.showSuccessAnimation || testConfetti) &&
			!hasShownConfetti &&
			!alreadyShown &&
			data
		) {
			const timer = setTimeout(() => {
				setHasShownConfetti(true);
				sessionStorage.setItem(confettiShownKey, "true");
				fireConfetti();

				// Clean up URL: strip query params and navigation state
				window.history.replaceState({}, document.title, location.pathname);
			}, 100);

			return () => clearTimeout(timer);
		}

		// If confetti param is present but already shown, clean up the URL silently
		if (
			(state?.showSuccessAnimation || testConfetti) &&
			(hasShownConfetti || alreadyShown)
		) {
			window.history.replaceState({}, document.title, location.pathname);
		}
	}, [
		location.state,
		location.search,
		location.pathname,
		hasShownConfetti,
		data,
		fireConfetti,
		id,
	]);

	// NOW we can do early returns - all hooks have been called
	// Only show loading on INITIAL load, not on background refetch
	if (isLoading && !data) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="size-12 mx-auto animate-spin text-blue-600" />
					<div className="text-lg font-medium text-muted-foreground">
						Loading project...
					</div>
				</div>
			</div>
		);
	}

	if (error || !data || !data.project) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div className="max-w-2xl space-y-6 text-center">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							<p className="text-lg font-semibold">
								Sorry, a project with id "{id}" does not exist.
							</p>
							<p className="mt-2 text-sm">
								This project likely has data issues, never existed or has been
								deleted.
							</p>
							<p className="mt-1 text-sm">
								If you believe this is in error, please submit feedback.
							</p>
						</AlertDescription>
					</Alert>

					<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						<NavigationButton targetPath="/projects" variant="default">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Projects
						</NavigationButton>
						<Button
							onClick={() => {
								const email = "ecoinformatics.admin@dbca.wa.gov.au";
								window.location.href = `mailto:${email}?subject=Feedback on Project ${id}&body=I have feedback on project ${id} and would like to report an issue.`;
							}}
							variant="secondary"
						>
							<Mail className="mr-2 h-4 w-4" />
							Submit Feedback
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Safe to destructure now
	const { project, documents, details, members } = data;

	// Handle tab change and navigate to the appropriate route
	const handleTabChange = (value: string) => {
		navigate(`/projects/${id}/${value}`);
	};

	// Manual breadcrumbs with project title (sanitised to remove HTML)
	const manualBreadcrumbs = [
		{ title: "Projects", link: "/projects" },
		{ title: sanitizeInput(project?.title || "Project") },
	];

	// Determine which tabs to show based on available documents
	const availableTabs = [
		{ value: "overview", label: "Overview", show: true },
		{
			value: "concept",
			label: "Concept Plan",
			show: !!documents?.concept_plan,
		},
		{
			value: "project",
			label: "Project Plan",
			show: !!documents?.project_plan,
		},
		{
			value: "progress",
			label: "Progress Reports",
			show:
				documents?.progress_reports && documents.progress_reports.length > 0,
		},
		{
			value: "student",
			label: "Student Reports",
			show: documents?.student_reports && documents.student_reports.length > 0,
		},
		{
			value: "closure",
			label: "Project Closure",
			show: !!documents?.project_closure,
		},
	].filter((tab) => tab.show);

	return (
		<PageTransition>
			<div className="space-y-6">
				{/* Breadcrumbs */}
				<AutoBreadcrumb overrideItems={manualBreadcrumbs} />

				{/* Deletion request banner — shown when project has a pending deletion request */}
				<DeletionRequestBanner
					project={project}
					currentUser={currentUser ?? null}
					userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
					onDeleteProject={handleBannerDeleteProject}
					onCancelRequest={handleBannerCancelRequest}
				/>

				<Tabs value={selectedTab} onValueChange={handleTabChange}>
					{/* Desktop: Horizontal tabs */}
					<TabsList className="hidden w-full justify-start project:inline-flex">
						{availableTabs.map((tabItem) => (
							<TabsTrigger key={tabItem.value} value={tabItem.value}>
								{tabItem.label}
							</TabsTrigger>
						))}
					</TabsList>

					{/* Mobile: Shadcn Select dropdown */}
					<div className="project:hidden">
						<Select value={selectedTab} onValueChange={handleTabChange}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select a tab" />
							</SelectTrigger>
							<SelectContent>
								{availableTabs.map((tabItem) => (
									<SelectItem key={tabItem.value} value={tabItem.value}>
										{tabItem.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Overview Tab */}
					<TabsContent value="overview">
						<OverviewTab
							project={project}
							details={details}
							members={members}
							documents={documents}
						/>
					</TabsContent>

					{/* Concept Plan Tab */}
					{documents?.concept_plan && (
						<TabsContent value="concept">
							<ConceptPlanTab
								conceptPlan={documents.concept_plan}
								project={project}
								members={members}
								projectId={project.id}
								creator={conceptPlanCreator}
								modifier={conceptPlanModifier}
								userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
								userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
								userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
								all_documents={documents}
								isBaLead={isBaLead}
							/>
						</TabsContent>
					)}

					{/* Project Plan Tab */}
					{documents?.project_plan && (
						<TabsContent value="project">
							<ProjectPlanTab
								projectPlan={documents.project_plan}
								project={project}
								members={members}
								projectId={project.id}
								hasProgressReports={
									documents.progress_reports &&
									documents.progress_reports.length > 0
								}
								creator={projectPlanCreator}
								modifier={projectPlanModifier}
								userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
								userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
								userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
								all_documents={documents}
								isBaLead={isBaLead}
								userData={currentUser}
							/>
						</TabsContent>
					)}

					{/* Progress Reports Tab */}
					{documents?.progress_reports &&
						documents.progress_reports.length > 0 && (
							<TabsContent value="progress">
								<ProgressReportsTab
									progressReports={documents.progress_reports}
									project={project}
									members={members}
									projectId={project.id}
									creator={undefined}
									modifier={undefined}
									userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
									userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
									userIsCaretakerOfProjectLeader={
										userIsCaretakerOfProjectLeader
									}
									all_documents={documents}
									isBaLead={isBaLead}
								/>
							</TabsContent>
						)}

					{/* Student Reports Tab */}
					{documents?.student_reports &&
						documents.student_reports.length > 0 && (
							<TabsContent value="student">
								<StudentReportsTab
									studentReports={documents.student_reports}
									project={project}
									members={members}
									projectId={project.id}
									creator={undefined}
									modifier={undefined}
									userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
									userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
									userIsCaretakerOfProjectLeader={
										userIsCaretakerOfProjectLeader
									}
									all_documents={documents}
									isBaLead={isBaLead}
								/>
							</TabsContent>
						)}

					{/* Project Closure Tab */}
					{documents?.project_closure && (
						<TabsContent value="closure">
							<ProjectClosureTab
								projectClosure={documents.project_closure}
								project={project}
								members={members}
								projectId={project.id}
								creator={projectClosureCreator}
								modifier={projectClosureModifier}
								userIsCaretakerOfAdmin={userIsCaretakerOfAdmin}
								userIsCaretakerOfBaLeader={userIsCaretakerOfBaLeader}
								userIsCaretakerOfProjectLeader={userIsCaretakerOfProjectLeader}
								all_documents={documents}
								isBaLead={isBaLead}
							/>
						</TabsContent>
					)}
				</Tabs>

				{/* Delete Project Modal — triggered from the deletion request banner */}
				<DeleteProjectModal
					isOpen={isDeletionBannerDeleteOpen}
					onClose={() => setIsDeletionBannerDeleteOpen(false)}
					projectId={project.id}
				/>
			</div>
		</PageTransition>
	);
}
