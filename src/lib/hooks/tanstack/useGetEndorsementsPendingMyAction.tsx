// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getEndorsementsPendingMyAction } from "../../api/api";

export const useGetEndorsementsPendingMyAction = () => {
  const { isPending, data } = useQuery({
    queryKey: ["endorsementsPendingMyAction"],
    queryFn: getEndorsementsPendingMyAction,
    retry: false,
  });
  return {
    pendingEndorsementsDataLoading: isPending,
    pendingEndorsementsData: data,
  };
};
