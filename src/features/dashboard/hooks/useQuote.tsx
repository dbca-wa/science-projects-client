// Hook used to fetch a quote

import { getQuote } from "@/features/dashboard/services/dashboard.service";
import type { IQuote } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useQuote = () => {
  const { data, isPending } = useQuery<IQuote>({
    queryKey: ["quote"],
    queryFn: getQuote,
    refetchOnWindowFocus: false,
  });
  return {
    quoteLoading: isPending,
    quote: data as IQuote,
  };
};
