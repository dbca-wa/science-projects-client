import { getPublicProfileCVData } from "@/features/staff-profiles/services/staff-profiles.service";
import type { IStaffCVData } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useStaffCV = (userPk: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["staffCV", userPk],
    queryFn: getPublicProfileCVData,
    retry: false,
  });
  return {
    staffCVLoading: isPending,
    staffCVData: data as IStaffCVData,
    refetch: refetch,
  };
};
