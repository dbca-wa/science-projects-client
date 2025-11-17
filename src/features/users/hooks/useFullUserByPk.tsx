// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { getFullUser } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useFullUserByPk = (pk: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["user", pk],
    queryFn: getFullUser,
    retry: false,
  });

  return {
    userLoading: isPending,
    userData: data,
    refetchUser: refetch,
  };
};
