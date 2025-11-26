import { getStaffProfiles } from "@/features/staff-profiles/services/staff-profiles.service";
import { useQuery } from "@tanstack/react-query";

export const useScienceStaffProfileList = ({
  searchTerm,
  page,
  showHidden,
}: {
  searchTerm: string;
  page: number;
  showHidden: boolean;
}) => {
  const { isPending, data } = useQuery({
    queryKey: ["staffprofiles", searchTerm, page, showHidden], // Added showHidden to queryKey to refetch on change
    queryFn: () => getStaffProfiles({ searchTerm, page, showHidden }),
    retry: false,
  });

  return {
    scienceStaffLoading: isPending,
    scienceStaffData: data,
  };
};
