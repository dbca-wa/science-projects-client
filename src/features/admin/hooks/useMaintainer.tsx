import type { IMiniUser } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import { getMaintainer } from "@/features/admin/services/admin.service";

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
