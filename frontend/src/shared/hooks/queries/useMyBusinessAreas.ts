import { useQuery } from "@tanstack/react-query";
import { getMyBusinessAreas } from "@/shared/services/org.service";

/**
 * Fetch business areas where the current user is the leader.
 * Shared hook — used across reports, layout, and pages.
 */
export const useMyBusinessAreas = () =>
	useQuery({
		queryKey: ["business-areas", "mine"],
		queryFn: getMyBusinessAreas,
		staleTime: 5 * 60_000,
	});
