// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query"
import { getDocumentsPendingStageOneAction } from "../api";

export const useGetDocumentsPendingStageOneInput = () => {
    const { isLoading, data, isError } = useQuery(["stageOneDocsPendingMyAction"], getDocumentsPendingStageOneAction, {
        retry: false,
    });
    if (!isLoading && data) {
        console.log(data)
    }
    return {
        docsPendingStageOneInputLoading: isLoading,
        docsPendingStageOneInput: data,
    }
}