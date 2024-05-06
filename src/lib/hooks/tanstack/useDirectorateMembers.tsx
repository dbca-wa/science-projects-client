import { useQuery } from "@tanstack/react-query";
import { getDirectorateMembers } from "../../api";

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
