// Simple hook for getting projects the user is involved in, for the dashboard.

import { getDocumentsPendingStageThreeAction } from "@/features/dashboard/services/dashboard.service";
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
