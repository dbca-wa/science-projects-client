// Simple hook for getting projects the user is involved in, for the dashboard.

import { getDocumentsPendingStageTwoAction } from "@/shared/lib/api";
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
