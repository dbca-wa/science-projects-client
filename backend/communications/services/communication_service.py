"""
Communication service - Business logic for communication operations
"""

from django.conf import settings
from rest_framework.exceptions import NotFound, PermissionDenied

from communications.models import ChatRoom, Comment, DirectMessage, Reaction
from communications.utils.mention_utils import process_comment_mentions
from documents.templatetags.custom_filters import extract_text_content


class CommunicationService:
    """Business logic for communication operations"""

    # ChatRoom operations
    @staticmethod
    def list_chat_rooms():
        """List all chat rooms"""
        return ChatRoom.objects.all()

    @staticmethod
    def get_chat_room(pk):
        """Get chat room by ID"""
        try:
            return ChatRoom.objects.get(pk=pk)
        except ChatRoom.DoesNotExist:
            raise NotFound(f"Chat room {pk} not found")

    @staticmethod
    def create_chat_room(user, data):
        """Create new chat room"""
        settings.LOGGER.info(f"{user} is creating a chat room")
        return ChatRoom.objects.create(**data)

    @staticmethod
    def update_chat_room(pk, user, data):
        """Update chat room"""
        chat_room = CommunicationService.get_chat_room(pk)
        settings.LOGGER.info(f"{user} is updating a chat room {chat_room}")

        for field, value in data.items():
            setattr(chat_room, field, value)
        chat_room.save()

        return chat_room

    @staticmethod
    def delete_chat_room(pk, user):
        """Delete chat room"""
        chat_room = CommunicationService.get_chat_room(pk)
        settings.LOGGER.info(f"{user} is deleting a chat room {chat_room}")
        chat_room.delete()

    # DirectMessage operations
    @staticmethod
    def list_direct_messages():
        """List all direct messages"""
        return DirectMessage.objects.all()

    @staticmethod
    def get_direct_message(pk):
        """Get direct message by ID"""
        try:
            return DirectMessage.objects.get(pk=pk)
        except DirectMessage.DoesNotExist:
            raise NotFound(f"Direct message {pk} not found")

    @staticmethod
    def create_direct_message(user, data):
        """Create new direct message"""
        settings.LOGGER.info(f"{user} is posting a dm")
        return DirectMessage.objects.create(**data)

    @staticmethod
    def update_direct_message(pk, user, data):
        """Update direct message"""
        dm = CommunicationService.get_direct_message(pk)
        settings.LOGGER.info(f"{user} is updating a dm {dm}")

        for field, value in data.items():
            setattr(dm, field, value)
        dm.save()

        return dm

    @staticmethod
    def delete_direct_message(pk, user):
        """Delete direct message"""
        dm = CommunicationService.get_direct_message(pk)
        settings.LOGGER.info(f"{user} is deleting a dm {dm}")
        dm.delete()

    # Comment operations
    @staticmethod
    def list_comments(document_id=None, parent_comment_id=None, top_level_only=False):
        """
        List comments with optional filtering

        Args:
            document_id: Optional document ID to filter by
            parent_comment_id: Optional parent comment ID to get replies
            top_level_only: If True, only return top-level comments (no parent)

        Returns:
            QuerySet of comments with optimised queries
        """
        queryset = Comment.objects.filter(is_removed=False)

        if document_id:
            queryset = queryset.filter(document_id=document_id)

        # Filter by parent comment or top-level
        if parent_comment_id is not None:
            queryset = queryset.filter(parent_comment_id=parent_comment_id)
        elif top_level_only:
            queryset = queryset.filter(parent_comment__isnull=True)

        # Optimise queries with select_related and prefetch_related
        queryset = queryset.select_related("user", "document", "parent_comment")
        queryset = queryset.prefetch_related("reactions", "mentions", "replies")

        # Order by created_at descending (newest first)
        return queryset.order_by("-created_at")

    @staticmethod
    def get_comment(pk):
        """
        Get comment by ID with optimised queries

        Args:
            pk: Comment primary key

        Returns:
            Comment instance

        Raises:
            NotFound: If comment doesn't exist
        """
        try:
            return (
                Comment.objects.select_related("user", "document", "parent_comment")
                .prefetch_related("reactions", "mentions", "replies")
                .get(pk=pk)
            )
        except Comment.DoesNotExist:
            raise NotFound(f"Comment {pk} not found")

    @staticmethod
    def create_comment(user, data):
        """
        Create new comment and process @mentions

        Args:
            user: User creating the comment
            data: Comment data dictionary

        Returns:
            Created comment instance
        """
        settings.LOGGER.info(
            f"{user} is posting a comment on document (ID: {data.get('document').pk}, Kind: {data.get('document').kind})"
        )

        # Add user to data before creating comment
        data["user"] = user

        comment = Comment.objects.create(**data)

        # Process @mentions in the comment
        mentioned_users = process_comment_mentions(comment)

        if mentioned_users:
            settings.LOGGER.info(
                f"Comment {comment.pk} mentions {len(mentioned_users)} users"
            )

        return comment

    @staticmethod
    def update_comment(pk, user, data):
        """
        Update comment and reprocess @mentions

        Args:
            pk: Comment primary key
            user: User updating the comment
            data: Updated comment data

        Returns:
            Updated comment instance

        Raises:
            PermissionDenied: If user is not superuser or comment creator
        """
        comment = CommunicationService.get_comment(pk)

        # Block update by non superusers/non-creators
        if not user.is_superuser and user != comment.user:
            raise PermissionDenied("You do not have permission to update this comment.")

        settings.LOGGER.info(f"{user} is updating comment {comment.pk}")

        # Update comment fields
        for field, value in data.items():
            setattr(comment, field, value)
        comment.save()

        # If text was updated, reprocess mentions
        if "text" in data:
            # Delete existing mentions
            comment.mentions.all().delete()

            # Process new mentions
            mentioned_users = process_comment_mentions(comment)

            if mentioned_users:
                settings.LOGGER.info(
                    f"Updated comment {comment.pk} now mentions {len(mentioned_users)} users"
                )

        return comment

    @staticmethod
    def delete_comment(pk, user):
        """
        Soft delete comment by setting is_removed=True

        Args:
            pk: Comment primary key
            user: User deleting the comment

        Raises:
            PermissionDenied: If user is not superuser or comment creator
        """
        comment = CommunicationService.get_comment(pk)

        # Block deletion by non superusers/non-creators
        if not user.is_superuser and user != comment.user:
            raise PermissionDenied("You do not have permission to delete this comment.")

        settings.LOGGER.info(
            f"{user} is soft deleting comment {comment.pk} from document {comment.document.pk}"
        )

        # Soft delete by setting is_removed=True
        comment.is_removed = True
        comment.save()

    # Reaction operations
    @staticmethod
    def list_reactions(comment_id=None):
        """
        List reactions with optional filtering

        Args:
            comment_id: Optional comment ID to filter by

        Returns:
            QuerySet of reactions
        """
        queryset = Reaction.objects.all()

        if comment_id:
            queryset = queryset.filter(comment_id=comment_id)

        return queryset

    @staticmethod
    def get_reaction(pk):
        """Get reaction by ID"""
        try:
            return Reaction.objects.get(pk=pk)
        except Reaction.DoesNotExist:
            raise NotFound(f"Reaction {pk} not found")

    @staticmethod
    def toggle_comment_reaction(user_id, comment_id, reaction_type):
        """
        Toggle reaction on a comment

        Args:
            user_id: ID of user toggling reaction
            comment_id: ID of comment to react to
            reaction_type: Type of reaction (thumbup, heart, laugh, etc.)

        Returns:
            tuple: (reaction_object or None, was_deleted: bool)
        """
        comment = CommunicationService.get_comment(comment_id)

        # Check if reaction already exists
        existing = Reaction.objects.filter(
            user=user_id,
            reaction=reaction_type,
            comment=comment_id,
        ).first()

        if existing:
            settings.LOGGER.info(
                f"User {user_id} removed their {reaction_type} reaction to:\n{extract_text_content(comment.text)}"
            )
            existing.delete()

            # Clean up any other reactions from this user (legacy data)
            other_reactions = Reaction.objects.filter(
                user=user_id,
                comment=comment_id,
            ).exclude(pk=existing.pk)

            if other_reactions.exists():
                count = other_reactions.count()
                other_reactions.delete()
                settings.LOGGER.info(
                    f"Cleaned up {count} duplicate reactions for user {user_id} on comment {comment_id}"
                )

            return None, True

        # Remove any existing reactions from this user (one-reaction-per-user constraint)
        existing_reactions = Reaction.objects.filter(
            user=user_id,
            comment=comment_id,
        )

        if existing_reactions.exists():
            count = existing_reactions.count()
            existing_reactions.delete()
            settings.LOGGER.info(
                f"Removed {count} existing reaction(s) for user {user_id} before adding {reaction_type}"
            )

        # Create new reaction
        reaction = Reaction.objects.create(
            comment=comment,
            user_id=user_id,
            reaction=reaction_type,
            direct_message=None,
        )

        settings.LOGGER.info(
            f"User {user_id} reacted with {reaction_type} to comment ({comment_id}):\n{extract_text_content(comment.text)}"
        )
        return reaction, False

    @staticmethod
    def update_reaction(pk, user, data):
        """Update reaction"""
        reaction = CommunicationService.get_reaction(pk)
        settings.LOGGER.info(f"{user} is updating a reaction detail {reaction}")

        for field, value in data.items():
            setattr(reaction, field, value)
        reaction.save()

        return reaction

    @staticmethod
    def delete_reaction(pk, user):
        """Delete reaction"""
        reaction = CommunicationService.get_reaction(pk)
        settings.LOGGER.info(f"{user} is deleting a reaction detail {reaction}")
        reaction.delete()
