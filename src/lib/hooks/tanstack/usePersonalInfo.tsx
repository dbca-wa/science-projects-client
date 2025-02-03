// Simple hook for getting the full profile data
// Exposes that data and the state of the query loading

import { IPersonalInformation } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getPersonalInformation } from "../../api";

export const usePersonalInfo = (userId: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["personalInfo", userId],
    queryFn: getPersonalInformation,
    retry: false,
  });
  return {
    isLoading: isPending,
    personalData: data as IPersonalInformation,
    refetch: refetch,
  };
};
