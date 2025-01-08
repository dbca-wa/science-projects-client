import { IMiniUser } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getMaintainer } from "../../api/api";

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
