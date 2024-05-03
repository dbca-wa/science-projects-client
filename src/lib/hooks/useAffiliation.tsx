// A simple hook which talks to the api to get the full branch data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getAffiliationByPk } from "../api";

export const useAffiliation = (pk: number) => {
  const { isLoading, data } = useQuery(
    ["affiliation", pk],
    getAffiliationByPk,
    {
      retry: false,
    }
  );

  return {
    affiliationLoading: isLoading,
    affiliationData: data,
  };
};
