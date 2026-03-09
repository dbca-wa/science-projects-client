/**
 * useProjectTeam Query Hook
 *
 * TanStack Query hook for fetching project team members.
 */

import { useQuery } from "@tanstack/react-query";
import { getProjectTeam } from "../services/team.service";
import { STALE_TIME } from "@/shared/constants";
import type { ITeamMember } from "../types/team.types";

/**
 * Fetch project team members
 *
 * @param projectId - The project ID
 * @returns Query result with team members array
 */
export const useProjectTeam = (projectId: number) => {
	return useQuery<ITeamMember[], Error>({
		queryKey: ["projects", projectId, "team"],
		queryFn: () => getProjectTeam(projectId),
		staleTime: STALE_TIME.MEDIUM, // 5 minutes - team data changes moderately
		enabled: !!projectId, // Only fetch if projectId is provided
	});
};
