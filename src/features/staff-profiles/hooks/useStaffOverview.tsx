import { getPublicProfileOverviewData } from "@/shared/lib/api";
import type { IStaffOverviewData } from "@/shared/types/index.d";
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
