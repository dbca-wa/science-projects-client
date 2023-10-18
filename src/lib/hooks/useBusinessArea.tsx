// Simple hook to get businessarea data and save it in a query key.
// Exposes data and loading states of query

import { useQuery } from "@tanstack/react-query";
import { getSingleBusinessArea } from "../api";
import { IBusinessArea } from "../../types";

export const useBusinessArea = (baPk: number) => {
    const { isLoading, data } = useQuery(["businessArea", baPk], getSingleBusinessArea,
        {
            retry: false,
        });

    return {
        baLoading: isLoading,
        baData: data as IBusinessArea,
    };
};