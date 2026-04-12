import { useStaffProfileProjects } from "../../hooks/useStaffProfileProjects";
import { useCurrentUser } from "@/features/auth";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { ChevronRight, Calendar } from "lucide-react";
import { extractTextFromHTML } from "@/shared/utils/html-display.utils";
import { getImageUrl } from "@/shared/utils/image.utils";
import type { IStaffProfileProject } from "../../types/staff-profile.types";

interface ProjectsSectionProps {
	userId: number;
}

const PRIOR_STATUSES = ["terminated", "suspended", "closed"];
const EXCLUDED_KINDS = ["student", "external"];

/** Maps backend role keys to human-readable display names */
const ROLE_DISPLAY_NAMES: Record<string, string> = {
	supervising: "Project Leader",
	research: "Science Support",
	technical: "Technical Support",
	academicsuper: "Academic Supervisor",
	student: "Supervised Student",
	group: "Involved Group",
	externalcol: "External Collaborator",
	externalpeer: "External Peer",
	consulted: "Consulted Peer",
};

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
		return (
			<p className="p-4 text-muted-foreground">No information recorded.</p>
		);
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
			<ProjectSubsection
				title="Current Projects"
				projects={currentProjects}
				currentYear={currentYear}
				isLoggedIn={isLoggedIn}
			/>
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
			{projects.length === 0 ? (
				<p className="text-muted-foreground">No information recorded.</p>
			) : (
				<div className="space-y-2.5">
					{projects.map((proj) => {
						const plainTitle = extractTextFromHTML(proj.title || "");
						const dates = formatDates(proj);
						const imageUrl = proj.image?.file
							? getImageUrl(proj.image.file)
							: null;

						const content = (
							<div
								className={`flex items-center gap-3.5 rounded-lg border border-[#2A6096]/15 bg-[#2A6096]/5 p-3 transition-all ${isLoggedIn ? "hover:border-[#2A6096]/30 hover:bg-[#2A6096]/[0.08] hover:shadow-sm group cursor-pointer" : ""}`}
							>
								{/* Thumbnail */}
								<div className="size-12 shrink-0 rounded-md overflow-hidden bg-[#2A6096]/10">
									<img
										src={imageUrl ?? "/dbca.jpg"}
										alt=""
										className="size-full object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).src = "/dbca.jpg";
										}}
									/>
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<p
										className={`font-medium text-sm text-slate-800 ${isLoggedIn ? "group-hover:text-[#2A6096]" : ""} transition-colors leading-snug line-clamp-1`}
									>
										{plainTitle}
									</p>
									<div className="flex items-center gap-2 mt-1.5">
										{proj.role && (
											<span className="text-xs font-semibold text-[#2A6096] bg-[#2A6096]/10 px-2 py-0.5 rounded">
												{ROLE_DISPLAY_NAMES[proj.role] ?? proj.role}
											</span>
										)}
										{dates && (
											<span className="flex items-center gap-1 text-xs text-slate-400">
												<Calendar className="size-3" aria-hidden="true" />
												{dates}
											</span>
										)}
									</div>
								</div>

								{isLoggedIn && (
									<ChevronRight
										className="size-4 text-[#2A6096]/30 group-hover:text-[#2A6096] transition-colors shrink-0"
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
			)}
		</div>
	);
};

export default ProjectsSection;
