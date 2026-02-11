import { useQuery } from "@tanstack/react-query";
import { getAllLocations } from "@/shared/services/api/locations.service";
import { STALE_TIME } from "@/shared/constants";

/**
 * Hook to get all locations organized by area type
 * Locations are relatively static data, so we use a longer stale time
 */
export const useLocations = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["locations"],
		queryFn: getAllLocations,
		staleTime: STALE_TIME.VERY_LONG, // 30 minutes - locations don't change often
	});

	return {
		locationsLoading: isLoading,
		dbcaRegions: data?.dbcaregion || [],
		dbcaDistricts: data?.dbcadistrict || [],
		ibra: data?.ibra || [],
		imcra: data?.imcra || [],
		nrm: data?.nrm || [],
		error,
	};
};
