// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getEndorsementsPendingMyAction } from "../api";

export const useGetEndorsementsPendingMyAction = () => {
  const { isLoading, data } = useQuery(
    ["endorsementsPendingMyAction"],
    getEndorsementsPendingMyAction,
    {
      retry: false,
    }
  );
  return {
    pendingEndorsementsDataLoading: isLoading,
    pendingEndorsementsData: data,
  };
};
