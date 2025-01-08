// Simple hook for getting the full profile data
// Exposes that data and the state of the query loading

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../api/api";
import { IProfile } from "@/types";

export const useProfile = (userId: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["profile", userId],
    queryFn: getProfile,
    retry: false,
  });
  return {
    isLoading: isPending,
    profileData: data as IProfile,
    refetch: refetch,
  };
};
