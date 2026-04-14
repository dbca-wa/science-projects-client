import { useQuery } from "@tanstack/react-query";
import { getMyStaffProfile } from "../services/staff-profile.service";

export const useMyStaffProfile = (enabled = true) => {
	return useQuery({
		queryKey: ["staffProfiles", "myProfile"],
		queryFn: getMyStaffProfile,
		staleTime: 5 * 60_000,
		enabled,
	});
};
