import { useQuery } from "@tanstack/react-query";
import { getDivisions } from "@/shared/services/org.service";

/**
 * Fetch all divisions.
 * Shared hook — used across admin, reports, layout, router, and pages.
 */
export const useDivisions = () =>
	useQuery({
		queryKey: ["divisions"],
		queryFn: getDivisions,
		staleTime: 10 * 60_000,
	});
