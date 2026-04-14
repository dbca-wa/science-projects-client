import { useQuery } from "@tanstack/react-query";
import { checkStaffProfile } from "../services/staff-profile.service";

export const useStaffProfileDetail = (userPk: number) => {
	return useQuery({
		queryKey: ["staffProfiles", "detail", userPk],
		queryFn: () => checkStaffProfile(userPk),
		staleTime: 5 * 60_000,
		enabled: userPk > 0,
	});
};
