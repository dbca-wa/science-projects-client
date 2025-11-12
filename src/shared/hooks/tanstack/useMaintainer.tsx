import { getMaintainer } from "@/shared/lib/api";
import type { IMiniUser } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useMaintainer = () => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["maintainer"],
    queryFn: getMaintainer,
    retry: false,
  });

  return {
    maintainerLoading: isPending,
    maintainerData: data?.maintainer as IMiniUser,
    refetch,
  };
};
