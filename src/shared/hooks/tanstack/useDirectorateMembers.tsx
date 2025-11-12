import { getDirectorateMembers } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useDirectorateMembers = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["directorate"],
    queryFn: getDirectorateMembers,
    retry: false,
  });
  return {
    isDirectorateLoading: isPending,
    directorateData: data,
    refetchDirectorateData: refetch,
  };
};
