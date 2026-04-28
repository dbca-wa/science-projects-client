import { useQuery } from "@tanstack/react-query";
import { getReportsForDivision } from "@/shared/services/report.service";

/**
 * Fetch all reports for a specific division, sorted by year descending.
 * Shared hook — used across admin and reports features.
 */
export const useReportsForDivision = (divisionSlug?: string) =>
	useQuery({
		queryKey: ["reports", "list", divisionSlug ?? "all"],
		queryFn: () => getReportsForDivision(divisionSlug),
		staleTime: 5 * 60_000,
	});
