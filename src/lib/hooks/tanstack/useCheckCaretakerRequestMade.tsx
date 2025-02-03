// Simple hook to get pending admin caretaker set requests for a user.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { checkPendingCaretakerRequestsByPk } from "../../api";

export const useCheckCaretakerRequestMade = (pk: { pk: number }) => {
  const { isPending, data } = useQuery({
    queryKey: ["caretakerRequests", pk],
    queryFn: checkPendingCaretakerRequestsByPk,
    retry: false,
  });

  return {
    checkLoading: isPending,
    checkResult: data,
  };
};
