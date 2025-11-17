import { getPublicProfileCVData } from "@/shared/lib/api";
import type { IStaffCVData } from "@/shared/types/index.d";
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
