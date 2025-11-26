import { getPublicProfileHeroData } from "@/features/staff-profiles/services/staff-profiles.service";
import type { IStaffProfileHeroData } from "@/shared/types";
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
