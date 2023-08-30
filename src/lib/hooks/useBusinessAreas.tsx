// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getAllBusinessAreas } from "../api";

export const useBusinessAreas = () => {
    const { isLoading, data } = useQuery(["businessAreas"], getAllBusinessAreas,
        {
            retry: false,
        });

    return {
        baLoading: isLoading,
        baData: data,
    };
};