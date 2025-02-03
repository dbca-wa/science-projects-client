// A simple hook which talks to the api to get the full branch data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getBranchByPk } from "../../api";

export const useBranch = (pk: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["branch", pk],
    queryFn: getBranchByPk,
    retry: false,
  });

  return {
    branchLoading: isPending,
    branchData: data,
  };
};
