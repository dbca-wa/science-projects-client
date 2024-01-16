// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getFullUser } from "../api";
// import { useEffect } from "react";

export const useFullUserByPk = (pk: number) => {
  const { isLoading, data } = useQuery(["user", pk], getFullUser, {
    retry: false,
  });

  return {
    userLoading: isLoading,
    userData: data,
  };
};
