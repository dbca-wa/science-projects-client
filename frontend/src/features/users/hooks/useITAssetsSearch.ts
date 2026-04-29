import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { searchITAssets, type ITAssetUser } from "../services/user.service";

/**
 * Hook for searching IT Assets directory with debounced input.
 *
 * Returns search results annotated with SPMS user/invite status.
 * Only fires the query when the debounced term is at least 2 characters.
 */
export const useITAssetsSearch = (debounceMs = 300) => {
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedTerm = useDebouncedValue(searchTerm, debounceMs);

	const query = useQuery<ITAssetUser[]>({
		queryKey: ["it-assets-search", debouncedTerm],
		queryFn: () => searchITAssets(debouncedTerm),
		enabled: debouncedTerm.length >= 2,
		staleTime: 30_000, // 30 seconds — directory data changes infrequently
	});

	return {
		searchTerm,
		setSearchTerm,
		results: query.data ?? [],
		isLoading: query.isLoading && debouncedTerm.length >= 2,
		isFetching: query.isFetching,
		error: query.error,
	};
};
