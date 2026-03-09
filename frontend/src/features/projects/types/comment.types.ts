/**
 * Comment Types
 *
 * Re-exports comment types from shared types.
 * Comment types are defined in shared because they're used across features.
 */

export type {
	IComment,
	ICommentCreate,
	ICommentUpdate,
	IReaction,
	ReactionType,
} from "@/shared/types/comment.types";
