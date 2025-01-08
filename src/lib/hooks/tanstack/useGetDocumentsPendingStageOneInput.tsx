// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getDocumentsPendingStageOneAction } from "../../api/api";

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
