import { useQuery } from "@tanstack/react-query";
import { getStaffProfiles } from "../services/staff-profile.service";

export const useStaffProfiles = (params: {
	search?: string;
	page?: number;
	showHidden?: boolean;
	pageSize?: number;
}) => {
	return useQuery({
		queryKey: [
			"staffProfiles",
			params.search,
			params.page,
			params.showHidden,
			params.pageSize,
		],
		queryFn: () => getStaffProfiles(params),
		staleTime: 2 * 60_000,
	});
};
