import { IStaffCVData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getPublicProfileCVData } from "../../api";

export const useStaffCV = (userPk: undefined | string | number) => {
  const { isPending, data, refetch } = useQuery({
    queryKey: ["staffCV", userPk],
    queryFn: getPublicProfileCVData,
    retry: false,
  });
  return {
    staffCVLoading: isPending,
    staffCVData: data as IStaffCVData,
    refetch: refetch,
  };
};
