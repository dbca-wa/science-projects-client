import { useQuery } from "@tanstack/react-query";
import { getPublicationsForUser } from "@/lib/api";

export const useUserPublications = (employee_id: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["publications", employee_id],
    queryFn: getPublicationsForUser,
    retry: false,
  });
  return {
    isLoading: isPending,
    publicationData: data,
    refetch: refetch,
  };
};
