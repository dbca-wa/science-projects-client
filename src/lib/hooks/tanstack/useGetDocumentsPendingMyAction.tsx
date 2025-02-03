// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getDocumentsPendingMyAction } from "../../api";

export const useGetDocumentsPendingMyAction = () => {
  const { isPending, data } = useQuery({
    queryKey: ["docsPendingMyAction"],
    queryFn: getDocumentsPendingMyAction,
    retry: false,
  });
  return {
    pendingProjectDocumentDataLoading: isPending,
    pendingProjectDocumentData: data,
  };
};
