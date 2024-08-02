import { useQuery } from "@tanstack/react-query";
import { getFullStaffProfile } from "../../api";

export const useStaffProfile = (
  staffProfilePk: undefined | string | number,
) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["staffProfile", staffProfilePk],
    queryFn: getFullStaffProfile,
    retry: false,
  });
  return {
    isLoading: isPending,
    staffProfileData: data,
    refetch: refetch,
  };
};
