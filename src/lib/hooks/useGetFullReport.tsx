// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getFullReport } from "../api";
// import { useEffect } from "react";

export const useGetFullReport = (pk: number) => {
    const { isLoading, data } = useQuery(["report", pk], getFullReport,
        {
            retry: false,
        });

    // useEffect(() => console.log(data), [data])

    return {
        reportLoading: isLoading,
        reportData: data,
    };
};