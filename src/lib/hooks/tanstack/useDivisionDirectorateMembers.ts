import { useQuery } from "@tanstack/react-query";
import { getDivisionDirectorateMembers } from "../../api";

export const useDivisionDirectorateMembers = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["directorateList", pk],
    queryFn: getDivisionDirectorateMembers,
    retry: false,
  });
  return {
    isDirectorateLoading: isPending,
    directorateData: data,
    refetchDirectorateData: refetch,
  };
};
