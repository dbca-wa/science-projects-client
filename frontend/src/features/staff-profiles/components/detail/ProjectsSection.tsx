import { useStaffProfileProjects } from "../../hooks/useStaffProfileProjects";
import { useCurrentUser } from "@/features/auth";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronRight, Calendar, Briefcase } from "lucide-react";
import { extractTextFromHTML } from "@/shared/utils/html-display.utils";
import type { IStaffProfileProject } from "../../types/staff-profile.types";

interface ProjectsSectionProps {
	userId: number;
}

const PRIOR_STATUSES = ["terminated", "suspended", "closed"];
const EXCLUDED_KINDS = ["student", "external"];

const ProjectsSection = ({ userId }: ProjectsSectionProps) => {
	const { data: projects, isLoading } = useStaffProfileProjects(userId);
	const { data: currentUser } = useCurrentUser();
	const isLoggedIn = !!currentUser;

	if (isLoading) {
		return (
			<div className="space-y-3 p-4">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-20 w-full rounded-lg" />
				))}
			</div>
		);
	}

	if (!projects || projects.length === 0) {
		return <p className="p-4 text-muted-foreground">No projects registered.</p>;
	}

	const filtered = projects.filter((p) => !EXCLUDED_KINDS.includes(p.kind));
	const currentProjects = filtered
		.filter((p) => !PRIOR_STATUSES.includes(p.status))
		.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0));
	const closedProjects = filtered
		.filter((p) => PRIOR_STATUSES.includes(p.status))
		.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0));

	const currentYear = new Date().getFullYear();

	return (
		<div className="w-full">
			{currentProjects.length > 0 && (
				<ProjectSubsection
					title="Current Projects"
					projects={currentProjects}
					currentYear={currentYear}
					isLoggedIn={isLoggedIn}
				/>
			)}
			{closedProjects.length > 0 && (
				<ProjectSubsection
					title="Closed Projects"
					projects={closedProjects}
					currentYear={currentYear}
					isLoggedIn={isLoggedIn}
				/>
			)}
		</div>
	);
};

const ProjectSubsection = ({
	title,
	projects,
	currentYear,
	isLoggedIn,
}: {
	title: string;
	projects: IStaffProfileProject[];
	currentYear: number;
	isLoggedIn: boolean;
}) => {
	const formatDates = (p: IStaffProfileProject) => {
		if (!p.start_date) return "";
		if (p.start_date === p.end_date) return `${p.start_date}`;
		const end =
			p.end_date && p.end_date >= currentYear ? "Present" : p.end_date;
		return `${p.start_date} – ${end ?? "Present"}`;
	};

	return (
		<div className="w-full p-4">
			<p className="text-lg font-semibold text-slate-900">{title}</p>
			<Separator className="mt-2 mb-3 bg-slate-200" />
			<div className="space-y-3">
				{projects.map((proj) => {
					const plainTitle = extractTextFromHTML(proj.title || "");
					const plainDesc = extractTextFromHTML(proj.description || "");
					const dates = formatDates(proj);

					const content = (
						<div
							className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white shadow-sm p-4 transition-all ${isLoggedIn ? "hover:border-blue-200 hover:shadow-md hover:bg-blue-50/30 group cursor-pointer" : ""}`}
						>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<p
										className={`font-medium text-slate-900 ${isLoggedIn ? "group-hover:text-blue-600" : ""} transition-colors`}
									>
										{plainTitle}
									</p>
									{proj.kind && (
										<Badge
											variant="secondary"
											className="shrink-0 text-xs capitalize"
										>
											{proj.kind.replace("_", " ")}
										</Badge>
									)}
								</div>

								<div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
									{dates && (
										<span className="flex items-center gap-1">
											<Calendar className="size-3" aria-hidden="true" />
											{dates}
										</span>
									)}
									{proj.role && (
										<span className="flex items-center gap-1">
											<Briefcase className="size-3" aria-hidden="true" />
											<span className="capitalize">{proj.role}</span>
										</span>
									)}
								</div>

								{plainDesc && (
									<p className="text-sm text-slate-500 mt-2 line-clamp-2">
										{plainDesc}
									</p>
								)}
							</div>

							{isLoggedIn && (
								<ChevronRight
									className="size-4 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0"
									aria-hidden="true"
								/>
							)}
						</div>
					);

					if (isLoggedIn) {
						return (
							<a
								key={proj.id}
								href={`/projects/${proj.id}/overview`}
								className="block"
							>
								{content}
							</a>
						);
					}

					return <div key={proj.id}>{content}</div>;
				})}
			</div>
		</div>
	);
};

export default ProjectsSection;
