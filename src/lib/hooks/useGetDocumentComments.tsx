// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getDocumentComments } from "../api";

export const useGetDocumentComments = (documentId: number) => {
  const { isLoading, data, isError, refetch } = useQuery(
    ["documentComments", documentId],
    getDocumentComments,
    {
      retry: false,
    }
  );

  const refetchData = (callback?: () => void) => {
    refetch().then(() => {
      if (callback) {
        callback();
      }
    });
  };
  return {
    documentCommentsLoading: isLoading,
    documentCommentsData: data,
    refetchComments: refetchData,
  };
};
