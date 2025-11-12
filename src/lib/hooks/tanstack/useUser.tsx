// Hook used to determine the user. Used on login and getting full profile from pk in data.

import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api";
import { IUserMe } from "@/types";

export const useUser = () => {
  const { isPending, data, isError, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false, //immediate fail if not logged in
  });
  // console.log(data)
  return {
    userLoading: isPending,
    userData: data as IUserMe,
    isLoggedIn: !isError,
    refetchUser: refetch,
  };
};
