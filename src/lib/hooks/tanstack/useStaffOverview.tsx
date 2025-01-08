import { useQuery } from "@tanstack/react-query";
import { getPublicProfileOverviewData } from "../../api/api";
import { IStaffOverviewData } from "@/types";

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
