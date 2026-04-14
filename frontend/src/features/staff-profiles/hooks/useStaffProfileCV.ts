import { useQuery } from "@tanstack/react-query";
import { getStaffProfileCV } from "../services/staff-profile.service";

export const useStaffProfileCV = (pk: number) => {
	return useQuery({
		queryKey: ["staffProfiles", "cv", pk],
		queryFn: () => getStaffProfileCV(pk),
		staleTime: 5 * 60_000,
		enabled: pk > 0,
	});
};
