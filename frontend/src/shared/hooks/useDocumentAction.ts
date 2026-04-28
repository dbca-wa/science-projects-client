import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	performDocumentAction,
	deleteDocument,
} from "../services/document.service";
import type { DocumentType } from "@/shared/utils/document.utils";
import type { DocumentActionRequest } from "../services/document.service";
import { extractUserFriendlyMessage } from "@/shared/utils/error.utils";

/**
 * Hook for performing document actions (submit, approve, recall, send_back, reopen)
 */
export const useDocumentAction = (
	documentType: DocumentType,
	projectId: number
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			documentId,
			data,
		}: {
			documentId: number;
			data: DocumentActionRequest;
		}) => performDocumentAction(documentType, documentId, data),
		onSuccess: async (_response, _variables) => {
			// Invalidate project query to refetch updated document data
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const [resource, type, id] = query.queryKey;
					// Match project detail queries where ID matches (as string or number)
					return (
						resource === "projects" &&
						type === "detail" &&
						(id === projectId || id === String(projectId))
					);
				},
			});

			// Show success toast
			toast.success("Action completed successfully");
		},
		onError: (error: Error) => {
			// Show user-friendly error toast
			const message = extractUserFriendlyMessage(
				error,
				"Failed to perform action"
			);
			toast.error(message);
		},
	});
};

/**
 * Hook for deleting a document
 */
export const useDeleteDocument = (
	documentType: DocumentType,
	projectId: number
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (documentId: number) =>
			deleteDocument(documentType, documentId),
		onSuccess: async (response) => {
			// Invalidate project query with await to ensure fresh data before navigation
			await queryClient.invalidateQueries({
				predicate: (query) => {
					const [resource, type, id] = query.queryKey;
					// Match project detail queries where ID matches (as string or number)
					return (
						resource === "projects" &&
						type === "detail" &&
						(id === projectId || id === String(projectId))
					);
				},
			});

			// Show success toast
			toast.success(response.message || "Document deleted successfully");
		},
		onError: (error: Error) => {
			// Show user-friendly error toast
			const message = extractUserFriendlyMessage(
				error,
				"Failed to delete document"
			);
			toast.error(message);
		},
	});
};
