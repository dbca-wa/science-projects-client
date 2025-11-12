import { getFullStaffProfile } from "@/shared/lib/api";
import type { IStaffProfileData } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useStaffProfile = (userPk: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["staffProfile", userPk],
    queryFn: getFullStaffProfile,
    retry: false,
  });
  return {
    staffProfileLoading: isPending,
    staffProfileData: data as IStaffProfileData,
    refetch: refetch,
  };
};
