import { useQuery } from "@tanstack/react-query";
import { getMyBusinessAreas } from "../services/report.service";

/**
 * Fetch business areas where the current user is the leader
 */
export const useMyBusinessAreas = () =>
	useQuery({
		queryKey: ["business-areas", "mine"],
		queryFn: getMyBusinessAreas,
		staleTime: 5 * 60_000,
	});
