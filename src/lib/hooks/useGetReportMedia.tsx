// A simple hook which talks to the api to get the full user data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getReportMedia } from "../api";
// import { useEffect } from "react";

export const useGetReportMedia = (pk: number) => {
    const { isLoading, data } = useQuery(["report", pk], getReportMedia,
        {
            retry: false,
        });

    // useEffect(() => console.log(data), [data])

    return {
        reportMediaLoading: isLoading,
        reportMediaData: data,
    };
};