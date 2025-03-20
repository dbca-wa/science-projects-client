import { useQuery } from "@tanstack/react-query";
import { getDivisionDirectorateMembers } from "../../api";
import { IDivision } from "@/types";

export const useDivisionDirectorateMembers = (
  pk: number | IDivision | undefined,
) => {
  const divisionPk = typeof pk === "object" ? pk?.pk : pk;

  const { isPending, data, refetch } = useQuery({
    queryKey: ["directorateList", divisionPk],
    queryFn: getDivisionDirectorateMembers,
    retry: false,
    enabled: !!divisionPk,
  });

  return {
    isDirectorateLoading: isPending,
    directorateData: data,
    refetchDirectorateData: refetch,
  };
};
