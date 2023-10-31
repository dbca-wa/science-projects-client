// A simple hook which talks to the api to get the full branch data.
// Exposes that data as well as the state of the query (loading or not)

import { useQuery } from "@tanstack/react-query";
import { getBranchByPk } from "../api";
// import { useEffect } from "react";

export const useBranch = (pk: number) => {
    const { isLoading, data } = useQuery(["branch", pk], getBranchByPk,
        {
            retry: false,
        });

    // useEffect(() => console.log(data), [data])

    return {
        branchLoading: isLoading,
        branchData: data,
    };
};