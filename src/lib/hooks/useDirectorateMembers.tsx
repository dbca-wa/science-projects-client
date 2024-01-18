import { useQuery } from "@tanstack/react-query";
import { getDirectorateMembers } from "../api";

export const useDirectorateMembers = () => {
  const { isLoading, data, refetch } = useQuery(
    ["directorate"],
    getDirectorateMembers,
    {
      retry: false,
    }
  );
  return {
    isDirectorateLoading: isLoading,
    directorateData: data,
    refetchDirectorateData: refetch,
  };
};
