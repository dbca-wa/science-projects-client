// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getScienceProfiles } from "../../api";

export const useScienceStaffProfileList = () => {
  const { isPending, data } = useQuery({
    queryKey: ["scienceProfiles"],
    queryFn: getScienceProfiles,
    retry: false,
  });

  return {
    scienceStaffLoading: isPending,
    scienceStaffData: data,
  };
};
