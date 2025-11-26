import { getDirectorateMembers } from "@/features/users/services/users.service";
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
