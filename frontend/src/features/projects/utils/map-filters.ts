import type { IProjectData } from "@/shared/types/project.types";

/**
 * Escape special regex characters in a string.
 * 
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Filter projects by search term.
 * 
 * Matches against project title and description (case-insensitive).
 * Returns all projects if search term is empty.
 * 
 * @param projects - Array of projects to filter
 * @param searchTerm - Search term to match
 * @returns Filtered array of projects
 */
export function filterBySearch(
  projects: IProjectData[],
  searchTerm: string
): IProjectData[] {
  // Return all projects if search term is empty
  const trimmedTerm = searchTerm.trim();
  if (!trimmedTerm) {
    return projects;
  }

  // Escape special regex characters
  const escapedTerm = escapeRegex(trimmedTerm);
  const regex = new RegExp(escapedTerm, "i"); // Case-insensitive

  return projects.filter((project) => {
    const matchesTitle = regex.test(project.title || "");
    const matchesDescription = regex.test(project.description || "");
    return matchesTitle || matchesDescription;
  });
}

/**
 * Filter projects by selected business area IDs.
 * 
 * Returns all projects if no business areas are selected.
 * Uses OR logic for multiple selections.
 * 
 * @param projects - Array of projects to filter
 * @param selectedBusinessAreaIds - Set of selected business area IDs
 * @returns Filtered array of projects
 */
export function filterByBusinessArea(
  projects: IProjectData[],
  selectedBusinessAreaIds: Set<number>
): IProjectData[] {
  // Return all projects if no business areas selected
  if (selectedBusinessAreaIds.size === 0) {
    return projects;
  }

  return projects.filter((project) =>
    selectedBusinessAreaIds.has(project.business_area?.id)
  );
}

/**
 * Apply combined filters to projects.
 * 
 * Combines search and business area filters using AND logic.
 * Returns projects with isFiltered flag indicating if they match all filters.
 * 
 * @param projects - Array of projects to filter
 * @param searchTerm - Search term to match
 * @param selectedBusinessAreaIds - Set of selected business area IDs
 * @returns Object with filtered and all projects with isFiltered flags
 */
export function applyCombinedFilters(
  projects: IProjectData[],
  searchTerm: string,
  selectedBusinessAreaIds: Set<number>
): {
  filteredProjects: IProjectData[];
  projectsWithFilterFlag: Array<{ project: IProjectData; isFiltered: boolean }>;
} {
  // Apply search filter
  const searchFiltered = filterBySearch(projects, searchTerm);

  // Apply business area filter
  const fullyFiltered = filterByBusinessArea(
    searchFiltered,
    selectedBusinessAreaIds
  );

  // Create set of filtered project IDs for quick lookup
  const filteredIds = new Set(fullyFiltered.map((p) => p.id));

  // Mark all projects with isFiltered flag
  const projectsWithFilterFlag = projects.map((project) => ({
    project,
    isFiltered: !filteredIds.has(project.id),
  }));

  return {
    filteredProjects: fullyFiltered,
    projectsWithFilterFlag,
  };
}
