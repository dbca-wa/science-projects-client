// Simple hook for getting projects the user is involved in, for the dashboard.

import { useQuery } from "@tanstack/react-query"
import { getDocumentsPendingApproval } from "../api";

export const useGetDocumentsPendingApproval = () => {
    const { isLoading, data, isError } = useQuery(["projectsWithUnapprovedDocs"], getDocumentsPendingApproval, {
        retry: false,
    });
    return {
        projectDocumentDataLoading: isLoading,
        pendingProjectDocumentData: data,
    }
}