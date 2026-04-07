import { useStaffProfileProjects } from "../../hooks/useStaffProfileProjects";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Link } from "react-router";

interface ProjectsSectionProps {
	userId: number;
}

const ProjectsSection = ({ userId }: ProjectsSectionProps) => {
	const { data: projects, isLoading } = useStaffProfileProjects(userId);

	if (isLoading) {
		return (
			<div className="space-y-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
			</div>
		);
	}

	if (!projects || projects.length === 0) {
		return <p className="text-slate-500">No projects found.</p>;
	}

	return (
		<div className="space-y-3">
			{projects.map((project) => (
				<Link
					key={project.id}
					to={`/projects/${project.id}/overview`}
					className="block rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
				>
					<h4 className="font-medium text-slate-900">{project.title}</h4>
					<div className="flex gap-2 mt-1 text-sm text-slate-500">
						{project.status && <span>{project.status}</span>}
						{project.kind && (
							<>
								<span>·</span>
								<span>{project.kind}</span>
							</>
						)}
					</div>
				</Link>
			))}
		</div>
	);
};

export default ProjectsSection;
