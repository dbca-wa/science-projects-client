// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getDocumentsPendingStageThreeAction } from "../../api/api";

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
