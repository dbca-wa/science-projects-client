import { checkUserActiveAndGetStaffProfileData } from "@/features/staff-profiles/services/staff-profiles.service";
import type { IStaffProfileBaseData } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useCheckStaffProfile = (userPk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["baseStaffProfile", userPk],
    queryFn: checkUserActiveAndGetStaffProfileData,
    retry: false,
  });
  return {
    staffBaseDataLoading: isPending,
    staffBaseData: data as IStaffProfileBaseData,
    refetch: refetch,
  };
};
