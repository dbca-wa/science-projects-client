// A simple hook which talks to the api to get the full branch data.
// Exposes that data as well as the state of the query (loading or not)

import { getAdminOptionsByPk } from "@/features/admin/services/admin.service";
import type { IAdminOptions } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useAdminOptions = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["adminOptions", pk],
    queryFn: getAdminOptionsByPk,
    retry: false,
  });

  return {
    adminOptionsLoading: isPending,
    adminOptionsData: data as IAdminOptions,
    refetch,
  };
};
