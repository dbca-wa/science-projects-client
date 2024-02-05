// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getLatestReportingYear } from "../api";

export const useLatestReportYear = () => {
    const { isLoading, data } = useQuery(["latestReport"], getLatestReportingYear, {
        retry: false,
    });

    return {
        latestYearLoading: isLoading,
        latestYear: data?.year,
    };
};
