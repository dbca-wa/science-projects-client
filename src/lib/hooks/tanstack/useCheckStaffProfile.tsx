import { useQuery } from "@tanstack/react-query";
import { checkUserActiveAndGetStaffProfileData } from "../../api/api";
import { IStaffProfileBaseData } from "@/types";

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
