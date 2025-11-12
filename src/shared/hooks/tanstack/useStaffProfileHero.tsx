import { getPublicProfileHeroData } from "@/shared/lib/api";
import type { IStaffProfileHeroData } from "@/shared/types/index.d";
import { useQuery } from "@tanstack/react-query";

export const useStaffProfileHero = (userPk: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["staffHero", userPk],
    queryFn: getPublicProfileHeroData,
    retry: false,
  });
  // console.log(data);
  return {
    staffHeroLoading: isPending,
    staffHeroData: data as IStaffProfileHeroData,
    refetch: refetch,
  };
};
