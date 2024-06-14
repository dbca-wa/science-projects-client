// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getMyBusinessAreas } from "../../api";
import { IBusinessArea } from "@/types";

export const useMyBusinessAreas = () => {
    const { isPending, data } = useQuery({
        queryKey: ["myBusinessAreas"],
        queryFn: getMyBusinessAreas,
        retry: false,
    });
    // Sort the branches alphabetically
    const sortedBA = data
        ? [...data].sort((a, b) => a.name.localeCompare(b.name))
        : [];

    return {
        basLoading: isPending,
        baData: sortedBA as IBusinessArea[],
    };
};
