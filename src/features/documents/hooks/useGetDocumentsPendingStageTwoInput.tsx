// Simple hook for getting projects the user is involved in, for the dashboard.

import { getDocumentsPendingStageTwoAction } from "@/features/dashboard/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export const useGetDocumentsPendingStageTwoInput = () => {
  const { isPending, data } = useQuery({
    queryKey: ["stageTwoDocsPendingMyAction"],
    queryFn: getDocumentsPendingStageTwoAction,
    retry: false,
  });

  return {
    docsPendingStageTwoInputLoading: isPending,
    docsPendingStageTwoInput: data,
  };
};
