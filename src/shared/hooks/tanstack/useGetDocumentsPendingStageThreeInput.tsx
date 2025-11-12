// Simple hook for getting projects the user is involved in, for the dashboard.

import { getDocumentsPendingStageThreeAction } from "@/shared/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useGetDocumentsPendingStageThreeInput = () => {
  const { isPending, data } = useQuery({
    queryKey: ["stageThreeDocsPendingMyAction"],
    queryFn: getDocumentsPendingStageThreeAction,
    retry: false,
  });

  return {
    docsPendingStageThreeInputLoading: isPending,
    docsPendingStageThreeInput: data,
  };
};
