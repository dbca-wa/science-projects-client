// Hook used to fetch a quote

import { useQuery } from "@tanstack/react-query";
import { IQuote } from "../../../types";
import { getQuote } from "../../api/api";

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
