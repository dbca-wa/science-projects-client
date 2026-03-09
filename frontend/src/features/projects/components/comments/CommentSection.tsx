import { useState, useMemo } from "react";
import { Info } from "lucide-react";
import { toast as _toast } from "sonner";
import { CommentList } from "./CommentList";
import { CommentForm } from "./CommentForm";
import { Separator } from "@/shared/components/ui/separator";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { ProjectSection } from "@/shared/components/ProjectSection";
import {
	useComments,
	useCreateComment,
	useUpdateComment,
	useDeleteComment,
} from "@/features/projects/hooks/useComments";
import { useCurrentUser } from "@/features/auth";
import { useProject } from "@/features/projects/hooks/useProject";
import { canUserComment } from "@/features/projects/utils/permissions/comment-permissions.utils";

interface CommentSectionProps {
	documentId: number;
	projectId: number;
}

/**
 * CommentSection Component
 *
 * Complete comment section for document tabs.
 * Displays comments list and form for creating new comments.
 * Handles comment creation, editing, and deletion with @mention support.
 * Includes real-time updates with polling and new comment notifications.
 */
export const CommentSection = ({
	documentId,
	projectId,
}: CommentSectionProps) => {
	const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
	const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
		null
	);

	// Fetch comments for this document with polling enabled
	const { data: comments = [], isLoading, error } = useComments(documentId);

	// Get current user for avatar and permissions
	const { data: currentUser } = useCurrentUser();

	// Fetch project data for permission checks
	const { data: project } = useProject(projectId);

	// Calculate if user can comment
	const canComment = useMemo(
		() => canUserComment(currentUser, project),
		[currentUser, project]
	);

	// Mutations
	const createMutation = useCreateComment();
	const updateMutation = useUpdateComment();
	const deleteMutation = useDeleteComment();

	// Handle new comment submission
	const handleCreateComment = async (
		text: string,
		mentionedUserIds?: number[]
	) => {
		// eslint-disable-next-line no-useless-catch
		try {
			await createMutation.mutateAsync({
				document: documentId,
				text,
				is_public: true,
				mentioned_user_ids: mentionedUserIds,
			});
			// Toast is shown by mutation hook
		} catch (error) {
			// Error toast is shown by mutation hook
			throw error; // Re-throw so form knows it failed
		}
	};

	// Handle reply submission
	const handleCreateReply = async (
		text: string,
		parentCommentId: number,
		mentionedUserIds?: number[]
	) => {
		// eslint-disable-next-line no-useless-catch
		try {
			await createMutation.mutateAsync({
				document: documentId,
				text,
				parent_comment: parentCommentId,
				is_public: true,
				mentioned_user_ids: mentionedUserIds,
			});
			setReplyingToCommentId(null);
			// Toast is shown by mutation hook
		} catch (error) {
			// Error toast is shown by mutation hook
			throw error;
		}
	};

	// Handle comment edit
	const handleEditComment = (commentId: number) => {
		setEditingCommentId(commentId);
	};

	// Handle reply button click
	const handleReply = (parentCommentId: number) => {
		setReplyingToCommentId(parentCommentId);
	};

	// Handle comment update
	const handleUpdateComment = async (
		commentId: number,
		text: string,
		mentionedUserIds?: number[]
	) => {
		// eslint-disable-next-line no-useless-catch
		try {
			await updateMutation.mutateAsync({
				commentId,
				data: {
					text,
					mentioned_user_ids: mentionedUserIds,
				},
			});
			setEditingCommentId(null);
			// Toast is shown by mutation hook
		} catch (error) {
			// Error toast is shown by mutation hook
			throw error;
		}
	};

	// Handle comment deletion
	const handleDeleteComment = async (commentId: number) => {
		try {
			await deleteMutation.mutateAsync({
				commentId,
				documentId,
			});
			// Toast is shown by mutation hook
		} catch (error) {
			console.error("Failed to delete comment:", error);
			// Error toast is shown by mutation hook
		}
	};

	return (
		<ProjectSection className="mt-8">
			{/* Section Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<h2 className="text-xl font-bold mb-2">Comments</h2>
					<p className="text-sm text-muted-foreground">
						Type @ followed by a user's name to mention them. An email will be
						sent to mentioned users. Note: You can mention team members, BA
						leads, and admin.
					</p>
				</div>
			</div>

			{/* Permission Alert - Show when user cannot comment */}
			{!canComment && (
				<Alert>
					<Info className="h-4 w-4" />
					<AlertDescription>
						You do not have permission to comment on this project. Only project
						team members, business area leads, Directorate users, and
						administrators can comment.
					</AlertDescription>
				</Alert>
			)}

			{/* Comment Form - Only show if user can comment */}
			{canComment && (
				<div className="@container bg-background rounded-lg border p-4">
					<CommentForm
						projectId={projectId}
						onSubmit={handleCreateComment}
						placeholder="Say something..."
						submitLabel="Post Comment"
						autoFocus={false}
						currentUser={currentUser}
					/>
				</div>
			)}

			{/* Separator between form and comments */}
			{comments.length > 0 && <Separator />}

			{/* Comments List */}
			<CommentList
				comments={comments}
				projectId={projectId}
				isLoading={isLoading}
				error={error}
				onEdit={handleEditComment}
				onUpdate={handleUpdateComment}
				onDelete={handleDeleteComment}
				onReply={handleReply}
				editingCommentId={editingCommentId}
				onCancelEdit={() => setEditingCommentId(null)}
				canComment={canComment}
				project={project}
			/>

			{/* Reply Mode - Show inline reply form */}
			{replyingToCommentId && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="@container bg-background p-6 rounded-lg max-w-2xl w-full mx-4">
						<h3 className="text-lg font-semibold mb-4">Reply to Comment</h3>
						<CommentForm
							projectId={projectId}
							onSubmit={(text, mentionedUserIds) =>
								handleCreateReply(text, replyingToCommentId, mentionedUserIds)
							}
							onCancel={() => setReplyingToCommentId(null)}
							placeholder="Say something..."
							submitLabel="Post Reply"
							showCancel={true}
							autoFocus={true}
						/>
					</div>
				</div>
			)}
		</ProjectSection>
	);
};
