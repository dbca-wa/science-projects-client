import { useQuery } from "@tanstack/react-query";
import { getPublicProfileHeroData } from "../../api";
import { IStaffProfileHeroData } from "@/types";

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
