import { useQuery } from "@tanstack/react-query";
import { getStaffProfileHero } from "../services/staff-profile.service";

export const useStaffProfileHero = (pk: number) => {
	return useQuery({
		queryKey: ["staffProfiles", "hero", pk],
		queryFn: () => getStaffProfileHero(pk),
		staleTime: 5 * 60_000,
		enabled: pk > 0,
	});
};
