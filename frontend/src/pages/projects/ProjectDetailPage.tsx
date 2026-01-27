import { useParams, useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useProject } from "@/features/projects/hooks/useProject";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Button } from "@/shared/components/ui/button";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
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

interface ProjectDetailPageProps {
	selectedTab?: string;
}

export default function ProjectDetailPage({ selectedTab = "overview" }: ProjectDetailPageProps) {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { data, isLoading, error } = useProject(id);
	const { fireConfetti } = useConfetti();
	const [hasShownConfetti, setHasShownConfetti] = useState(false);

	// Check for success animation flag from navigation state
	useEffect(() => {
		const state = location.state as { showSuccessAnimation?: boolean } | null;
		
		// Also check for URL parameter for testing (e.g., ?confetti=true)
		const searchParams = new URLSearchParams(location.search);
		const testConfetti = searchParams.get("confetti") === "true";
		
		if ((state?.showSuccessAnimation || testConfetti) && !hasShownConfetti && data) {
			// Fire confetti after a short delay to ensure canvas is rendered
			const timer = setTimeout(() => {
				setHasShownConfetti(true);
				// Fire confetti with project kind colors
				fireConfetti();
			}, 100);

			// Clear the state to prevent confetti on refresh (but keep URL param for testing)
			if (state?.showSuccessAnimation) {
				window.history.replaceState({}, document.title);
			}

			return () => clearTimeout(timer);
		}
	}, [location.state, location.search, hasShownConfetti, data, fireConfetti]);

	// Handle tab change and navigate to the appropriate route
	const handleTabChange = (value: string) => {
		navigate(`/projects/${id}/${value}`);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	// Error state - project not found
	if (error || !data) {
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
								This project likely has data issues, never existed or has been deleted.
							</p>
							<p className="mt-1 text-sm">
								If you believe this is in error, please submit feedback.
							</p>
						</AlertDescription>
					</Alert>

					<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						<Button onClick={() => navigate("/projects")} variant="default">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Projects
						</Button>
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

	const { project, documents, details, members } = data;

	// Determine which tabs to show based on available documents
	const availableTabs = [
		{ value: "overview", label: "Overview", show: true },
		{ value: "concept", label: "Concept Plan", show: !!documents?.concept_plan },
		{ value: "project", label: "Project Plan", show: !!documents?.project_plan },
		{
			value: "progress",
			label: "Progress Reports",
			show: documents?.progress_reports && documents.progress_reports.length > 0,
		},
		{
			value: "student",
			label: "Student Reports",
			show: documents?.student_reports && documents.student_reports.length > 0,
		},
		{ value: "closure", label: "Project Closure", show: !!documents?.project_closure },
	].filter((tab) => tab.show);

	return (
		<div className="space-y-6">
			{/* Back to Projects Button */}
			<div>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate("/projects")}
					className="gap-2"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Projects
				</Button>
			</div>

			<Tabs value={selectedTab} onValueChange={handleTabChange}>
				{/* Desktop: Horizontal tabs */}
				<TabsList className="hidden w-full justify-start md:inline-flex">
					{availableTabs.map((tabItem) => (
						<TabsTrigger key={tabItem.value} value={tabItem.value}>
							{tabItem.label}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Mobile: Shadcn Select dropdown */}
				<div className="md:hidden">
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
					<OverviewTab project={project} details={details} members={members} />
				</TabsContent>

				{/* Concept Plan Tab */}
				{documents?.concept_plan && (
					<TabsContent value="concept">
						<ConceptPlanTab document={documents.concept_plan} />
					</TabsContent>
				)}

				{/* Project Plan Tab */}
				{documents?.project_plan && (
					<TabsContent value="project">
						<ProjectPlanTab document={documents.project_plan} />
					</TabsContent>
				)}

				{/* Progress Reports Tab */}
				{documents?.progress_reports && documents.progress_reports.length > 0 && (
					<TabsContent value="progress">
						<ProgressReportsTab documents={documents.progress_reports} />
					</TabsContent>
				)}

				{/* Student Reports Tab */}
				{documents?.student_reports && documents.student_reports.length > 0 && (
					<TabsContent value="student">
						<StudentReportsTab documents={documents.student_reports} />
					</TabsContent>
				)}

				{/* Project Closure Tab */}
				{documents?.project_closure && (
					<TabsContent value="closure">
						<ProjectClosureTab document={documents.project_closure} />
					</TabsContent>
				)}
			</Tabs>
		</div>
	);
}
