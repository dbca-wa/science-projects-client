import { useQuery } from "@tanstack/react-query";
import { getPublications } from "../services/staff-profile.service";

export const usePublications = (employeeId: string | null) => {
	return useQuery({
		queryKey: ["publications", employeeId],
		queryFn: () => getPublications(employeeId!),
		staleTime: 5 * 60_000,
		enabled: !!employeeId && employeeId !== "null",
	});
};
