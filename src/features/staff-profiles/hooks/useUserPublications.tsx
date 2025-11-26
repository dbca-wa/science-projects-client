import { getPublicationsForUser } from "@/features/staff-profiles/services/staff-profiles.service";
import type { PublicationResponse } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useUserPublications = (employee_id: string) => {
  const { isPending, data, refetch } = useQuery<PublicationResponse>({
    queryKey: ["publications", employee_id],
    queryFn: getPublicationsForUser,
    retry: false,
    enabled: employee_id && employee_id !== "null", // Only run if valid ID (not null)
  });
  return {
    isLoading: isPending,
    publicationData: data,
    refetch: refetch,
  };
};
