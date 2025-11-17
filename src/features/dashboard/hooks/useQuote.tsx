// Hook used to fetch a quote

import { getQuote } from "@/shared/lib/api";
import type { IQuote } from "@/shared/types/index.d";
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
