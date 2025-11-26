// Simple hook for getting projects the user is involved in, for the dashboard.

import { getDocumentsPendingMyAction } from "@/features/dashboard/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

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
