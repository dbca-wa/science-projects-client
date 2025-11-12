// A simple hook which talks to the api to get the full branch data.
// Exposes that data as well as the state of the query (loading or not)

import { getAffiliationByPk } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useAffiliation = (pk: number) => {
  const { isPending, data } = useQuery({
    queryKey: ["affiliation", pk],
    queryFn: getAffiliationByPk,
    retry: false,
  });

  return {
    affiliationLoading: isPending,
    affiliationData: data,
  };
};
