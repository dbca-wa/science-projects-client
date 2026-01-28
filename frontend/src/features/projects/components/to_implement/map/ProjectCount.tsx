import { MapPin } from "lucide-react";

interface ProjectCountProps {
  count: number;
}

/**
 * ProjectCount component
 * 
 * Display count of visible projects.
 * Shows "No projects found" when count is 0.
 */
export const ProjectCount = ({ count }: ProjectCountProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3">
      <MapPin className="h-4 w-4" />
      {count === 0 ? (
        <span>No projects found</span>
      ) : (
        <span>
          {count} {count === 1 ? "project" : "projects"} visible
        </span>
      )}
    </div>
  );
};
