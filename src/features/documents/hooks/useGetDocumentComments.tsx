// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query";
import { getDocumentComments } from "@/features/documents/services/documents.service";

export const useGetDocumentComments = (documentId: number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["documentComments", documentId],
    queryFn: getDocumentComments,
    retry: false,
  });

  const refetchData = (callback?: () => void) => {
    refetch().then(() => {
      if (callback) {
        callback();
      }
    });
  };
  return {
    documentCommentsLoading: isPending,
    documentCommentsData: data,
    refetchComments: refetchData,
  };
};
