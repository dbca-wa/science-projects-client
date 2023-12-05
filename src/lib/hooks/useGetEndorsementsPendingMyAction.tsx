// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query"
import { getDocumentsPendingMyAction, getEndorsementsPendingMyAction } from "../api";

export const useGetEndorsementsPendingMyAction = () => {
    const { isLoading, data, isError } = useQuery(["endorsementsPendingMyAction"], getEndorsementsPendingMyAction, {
        retry: false,
    });
    return {
        pendingEndorsementsDataLoading: isLoading,
        pendingEndorsementsData: data,
    }
}