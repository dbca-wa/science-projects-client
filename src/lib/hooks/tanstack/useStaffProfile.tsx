import { useQuery } from "@tanstack/react-query";
import { getFullStaffProfile } from "../../api";
import { IStaffProfileData } from "@/types";

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
