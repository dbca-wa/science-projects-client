import { useQuery } from "@tanstack/react-query";
import { getStaffProfiles } from "../../api/api";

export const useScienceStaffProfileList = ({
  searchTerm,
  page,
}: {
  searchTerm: string;
  page: number;
}) => {
  const { isPending, data } = useQuery({
    queryKey: ["staffprofiles", searchTerm, page],
    queryFn: () => getStaffProfiles({ searchTerm, page }),
    retry: false,
  });

  return {
    scienceStaffLoading: isPending,
    scienceStaffData: data,
  };
};
