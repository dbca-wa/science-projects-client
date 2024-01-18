// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getDocumentsPendingStageTwoAction } from "../api";

export const useGetDocumentsPendingStageTwoInput = () => {
  const { isLoading, data } = useQuery(
    ["stageTwoDocsPendingMyAction"],
    getDocumentsPendingStageTwoAction,
    {
      retry: false,
    }
  );
  if (!isLoading && data) {
    console.log(data);
  }
  return {
    docsPendingStageTwoInputLoading: isLoading,
    docsPendingStageTwoInput: data,
  };
};
