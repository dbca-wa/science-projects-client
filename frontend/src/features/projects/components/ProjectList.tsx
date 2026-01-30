import { ProjectCard } from "./ProjectCard";
import type { IProjectData } from "@/shared/types/project.types";

interface ProjectListProps {
  projects: IProjectData[];
  isLoading?: boolean;
}

/**
 * ProjectList component displays a grid of project cards
 * Handles responsive layout
 */
export const ProjectList = ({ projects, isLoading = false }: ProjectListProps) => {
  // Don't render anything if no projects (let parent handle empty states)
  if (!isLoading && projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-6 gap-6 mt-8">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
