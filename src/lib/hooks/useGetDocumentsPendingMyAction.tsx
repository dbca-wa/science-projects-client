// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query"
import { getDocumentsPendingMyAction } from "../api";

export const useGetDocumentsPendingMyAction = () => {
    const { isLoading, data, isError } = useQuery(["docsPendingMyAction"], getDocumentsPendingMyAction, {
        retry: false,
    });
    return {
        pendingProjectDocumentDataLoading: isLoading,
        pendingProjectDocumentData: data,
    }
}