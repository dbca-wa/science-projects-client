// Simple hook for getting the full profile data
// Exposes that data and the state of the query loading

import { getProfile } from "@/shared/lib/api";
import type { IProfile } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

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
