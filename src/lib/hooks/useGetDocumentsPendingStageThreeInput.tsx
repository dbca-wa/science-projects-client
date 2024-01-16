// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getDocumentsPendingStageThreeAction } from "../api";

export const useGetDocumentsPendingStageThreeInput = () => {
  const { isLoading, data } = useQuery(
    ["stageThreeDocsPendingMyAction"],
    getDocumentsPendingStageThreeAction,
    {
      retry: false,
    }
  );
  if (!isLoading && data) {
    console.log(data);
  }
  return {
    docsPendingStageThreeInputLoading: isLoading,
    docsPendingStageThreeInput: data,
  };
};
