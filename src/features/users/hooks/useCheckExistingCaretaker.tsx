// Hook used to determine the user. Used on login and getting full profile from pk in data.

import { checkCaretakerStatus } from "@/shared/lib/api";
import type { ICheckCaretakerStatus } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useCheckExistingCaretaker = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["myCaretakerStatus"],
    queryFn: checkCaretakerStatus,
    retry: false, //immediate fail if not logged in
  });
  // console.log(data)
  return {
    caretakerDataLoading: isPending,
    caretakerData: data as ICheckCaretakerStatus,
    refetchCaretakerData: refetch,
  };
};
