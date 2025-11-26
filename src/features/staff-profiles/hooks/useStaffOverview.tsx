import { getPublicProfileOverviewData } from "@/features/staff-profiles/services/staff-profiles.service";
import type { IStaffOverviewData } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useStaffOverview = (userPk: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["staffOverview", userPk],
    queryFn: getPublicProfileOverviewData,
    retry: false,
  });
  return {
    staffOverviewLoading: isPending,
    staffOverviewData: data as IStaffOverviewData,
    refetch: refetch,
  };
};
