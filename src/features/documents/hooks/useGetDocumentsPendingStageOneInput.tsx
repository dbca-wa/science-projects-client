// Simple hook for getting projects the user is involved in, for the dashboard.

import { getDocumentsPendingStageOneAction } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetDocumentsPendingStageOneInput = () => {
  const { isPending, data } = useQuery({
    queryKey: ["stageOneDocsPendingMyAction"],
    queryFn: getDocumentsPendingStageOneAction,
    retry: false,
  });
  return {
    docsPendingStageOneInputLoading: isPending,
    docsPendingStageOneInput: data,
  };
};
