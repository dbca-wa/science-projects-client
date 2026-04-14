import { useQuery } from "@tanstack/react-query";
import { getStaffProfileOverview } from "../services/staff-profile.service";

export const useStaffProfileOverview = (pk: number) => {
	return useQuery({
		queryKey: ["staffProfiles", "overview", pk],
		queryFn: () => getStaffProfileOverview(pk),
		staleTime: 5 * 60_000,
		enabled: pk > 0,
	});
};
