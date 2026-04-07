import { useQuery } from "@tanstack/react-query";
import { getStaffProfileProjects } from "../services/staff-profile.service";

export const useStaffProfileProjects = (userPk: number) => {
	return useQuery({
		queryKey: ["staffProfiles", "projects", userPk],
		queryFn: () => getStaffProfileProjects(userPk),
		staleTime: 5 * 60_000,
		enabled: userPk > 0,
	});
};
