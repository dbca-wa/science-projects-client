import { useNavigate } from "react-router";
import { ProjectTypeCard } from "@/features/projects/components/ProjectTypeCard";
import {
	FlaskConical,
	Briefcase,
	GraduationCap,
	Users,
	AlertCircle,
} from "lucide-react";
import { PROJECT_KIND_COLORS } from "@/shared/constants/project-colors";
import { AutoBreadcrumb } from "@/shared/components/navigation/AutoBreadcrumb";
import { PageTransition } from "@/shared/components/PageTransition";

const PROJECT_TYPES = [
	{
		title: "Science Project",
		description:
			"A discrete body of DBCA-led scientific work with a defined period of activity or an externally led science project with DBCA involvement.",
		requirements: [
			"Requires approval through SPMS",
			"Requires annual progress reporting",
			"Requires closure form to close",
		],
		icon: FlaskConical,
		color: PROJECT_KIND_COLORS.science,
		kind: "science" as const,
	},
	{
		title: "Core Function",
		description:
			"An ongoing body of scientific work that supports biodiversity science, conservation and other business functions.",
		requirements: [
			"Requires prior approval by Executive Director",
			"Requires annual progress reporting",
			"Immediate closure without closure form",
		],
		icon: Briefcase,
		color: PROJECT_KIND_COLORS.core_function,
		kind: "core_function" as const,
	},
	{
		title: "Student Project",
		description:
			"A project being undertaken by a student to attain a higher degree for which a DBCA staff member is a co-supervisor.",
		requirements: [
			"Requires prior approval by Executive Director",
			"Requires annual progress reporting",
			"Immediate closure without closure form",
		],
		icon: GraduationCap,
		color: PROJECT_KIND_COLORS.student,
		kind: "student" as const,
	},
	{
		title: "External Partnership",
		description:
			"A formal collaborative scientific partnership with an external organisation or organisations.",
		requirements: [
			"Requires prior approval by Executive Director",
			"Project details automatically included in annual reporting",
			"Immediate closure without closure form",
		],
		icon: Users,
		color: PROJECT_KIND_COLORS.external,
		kind: "external" as const,
	},
];

export default function ProjectCreatePage() {
	const navigate = useNavigate();

	const handleTypeSelect = (kind: string) => {
		// Navigate to wizard with project kind
		navigate(`/projects/create/wizard?kind=${kind}`);
	};

	return (
		<PageTransition>
			<div className="w-full">
				{/* Breadcrumb */}
				<AutoBreadcrumb />

				{/* Page Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">
						Create New Project
					</h1>
					<p className="mt-2 text-muted-foreground">
						Choose the project type that best fits your work
					</p>
				</div>

				{/* Warning Alert */}
				<div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20 px-4 py-3">
					<div className="flex flex-col gap-2 items-start">
						<div className="flex gap-2 items-center ">
							<AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-500 mt-0.5" />
							<p className="leading-relaxed text-blue-900 dark:text-blue-200 flex-1 min-w-0">
								<strong className="font-semibold">Important</strong>
							</p>
						</div>
						<p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200 flex-1 min-w-0">
							Projects differ by documentation structure, approval process, and
							reporting requirements. Make sure you choose the correct project
							type as you will not be able to change this after creation. If you
							need to change the project type, you will need to request that the
							project be deleted by an administrator and create a new project of
							the desired type. For further guidance on project types, refer to{" "}
							<span
								role="button"
								tabIndex={0}
								className="text-sm font-semibold text-blue-700 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
								onClick={() =>
									window.open(
										"https://dpaw.sharepoint.com/Key%20documents/Forms/AllItems.aspx?FilterField1=Category&FilterValue1=Corporate%20guideline&FilterType1=Choice&FilterDisplay1=Corporate%20guideline&id=%2FKey%20documents%2FCorporate%20Guideline%2048%20%2D%20Science%20Implementation%2Epdf&viewid=f605923d%2D172f%2D4d35%2Db8ee%2D3f0d60db0ef7&parent=%2FKey%20documents",
										"_blank"
									)
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										window.open(
											"https://dpaw.sharepoint.com/Key%20documents/Forms/AllItems.aspx?FilterField1=Category&FilterValue1=Corporate%20guideline&FilterType1=Choice&FilterDisplay1=Corporate%20guideline&id=%2FKey%20documents%2FCorporate%20Guideline%2048%20%2D%20Science%20Implementation%2Epdf&viewid=f605923d%2D172f%2D4d35%2Db8ee%2D3f0d60db0ef7&parent=%2FKey%20documents",
											"_blank"
										);
									}
								}}
							>
								Corporate Guideline 48 - Science Implementation
							</span>
							.
						</p>
					</div>
				</div>

				{/* Project Type Cards Grid */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 3xl:grid-cols-4">
					{PROJECT_TYPES.map((type, index) => (
						<div
							key={type.kind}
							className="animate-in fade-in slide-in-from-bottom-4"
							style={{
								animationDelay: `${index * 100}ms`,
								animationDuration: "500ms",
								animationFillMode: "backwards",
							}}
						>
							<ProjectTypeCard
								title={type.title}
								description={type.description}
								requirements={type.requirements}
								icon={type.icon}
								color={type.color}
								onClick={() => handleTypeSelect(type.kind)}
							/>
						</div>
					))}
				</div>

				{/* Help Text */}
				<div className="mt-8 text-center">
					<p className="text-sm text-muted-foreground">
						Need help choosing? Contact your supervisor or the SPMS
						administrator
					</p>
				</div>
			</div>
		</PageTransition>
	);
}
