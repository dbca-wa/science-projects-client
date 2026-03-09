# region Imports ================================================================================================

from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, SerializerMethodField

from documents.serializers import TinyProjectDocumentSerializer
from users.serializers import TinyUserSerializer

from .models import ChatRoom, Comment, CommentMention, DirectMessage, Reaction

# endregion ====================================================================================================


# region serializers =============================================================================================


# Direct Messages --------------------------------------------------------------------------------------------


class TinyDirectMessageSerializer(ModelSerializer):
    user = TinyUserSerializer(read_only=True)

    class Meta:
        model = DirectMessage
        fields = [
            "id",
            "text",
            "user",
            "chat_room",
        ]


class TinyReactionSerializer(ModelSerializer):
    user = TinyUserSerializer(read_only=True)
    direct_message = TinyDirectMessageSerializer()

    class Meta:
        model = Reaction
        fields = [
            "id",
            "user",
            "direct_message",
            "comment",
            "reaction",
            "created_at",
        ]


# Comments --------------------------------------------------------------------------------------------


class CommentMentionSerializer(ModelSerializer):
    """Serializer for comment mentions"""

    mentioned_user = TinyUserSerializer(read_only=True)

    class Meta:
        model = CommentMention
        fields = [
            "id",
            "mentioned_user",
            "created_at",
        ]


class TinyCommentSerializer(ModelSerializer):
    user = TinyUserSerializer(read_only=True)
    reactions = TinyReactionSerializer(many=True)
    mentions = CommentMentionSerializer(many=True, read_only=True)
    reply_count = SerializerMethodField()
    has_replies = SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "document",
            "text",
            "parent_comment",
            "created_at",
            "updated_at",
            "reactions",
            "mentions",
            "reply_count",
            "has_replies",
        ]

    def get_reply_count(self, obj):
        """Get count of direct replies to this comment"""
        return obj.replies.filter(is_removed=False).count()

    def get_has_replies(self, obj):
        """Check if comment has any replies"""
        return obj.replies.filter(is_removed=False).exists()


class TinyCommentCreateSerializer(ModelSerializer):

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "document",
            "text",
            "parent_comment",
            "created_at",
            "updated_at",
        ]


class CommentCreateSerializer(ModelSerializer):
    """Serializer for creating comments with writable foreign keys"""

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "document",
            "text",
            "parent_comment",
            "ip_address",
            "is_public",
            "is_removed",
            "created_at",
            "updated_at",
        ]

    def validate_text(self, value):
        """Validate comment text length"""
        if len(value) > 1500:
            raise serializers.ValidationError(
                "Comment text must be 1500 characters or less"
            )
        return value


class CommentSerializer(ModelSerializer):
    """Full comment serializer with all related data"""

    user = TinyUserSerializer(read_only=True)
    document = TinyProjectDocumentSerializer(read_only=True)
    reactions = TinyReactionSerializer(many=True, read_only=True)
    mentions = CommentMentionSerializer(many=True, read_only=True)
    replies = SerializerMethodField()
    reply_count = SerializerMethodField()
    has_replies = SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "document",
            "text",
            "parent_comment",
            "ip_address",
            "is_public",
            "is_removed",
            "created_at",
            "updated_at",
            "reactions",
            "mentions",
            "replies",
            "reply_count",
            "has_replies",
        ]

    def get_replies(self, obj):
        """Get direct replies to this comment (not nested further)"""
        # Only include non-removed replies
        replies = obj.replies.filter(is_removed=False).order_by("created_at")
        return TinyCommentSerializer(replies, many=True).data

    def get_reply_count(self, obj):
        """Get count of direct replies to this comment"""
        return obj.replies.filter(is_removed=False).count()

    def get_has_replies(self, obj):
        """Check if comment has any replies"""
        return obj.replies.filter(is_removed=False).exists()


# Chat Rooms & Direct Messages --------------------------------------------------------------------------------------------


class TinyChatRoomSerializer(ModelSerializer):
    users = TinyUserSerializer(read_only=True, many=True)

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "users",
        ]


class DirectMessageCreateSerializer(ModelSerializer):
    """Serializer for creating direct messages with writable foreign keys"""

    class Meta:
        model = DirectMessage
        fields = [
            "id",
            "text",
            "user",
            "chat_room",
            "ip_address",
            "is_public",
            "is_removed",
            "created_at",
            "updated_at",
        ]


class DirectMessageSerializer(ModelSerializer):
    user = TinyUserSerializer(read_only=True)
    chat_room = TinyChatRoomSerializer(read_only=True)
    reactions = TinyReactionSerializer(read_only=True, many=True)

    class Meta:
        model = DirectMessage
        fields = "__all__"


class ChatRoomSerializer(ModelSerializer):
    users = TinyUserSerializer(read_only=True, many=True)
    messages = TinyDirectMessageSerializer(read_only=True, many=True)

    class Meta:
        model = ChatRoom
        fields = "__all__"


# Reactions --------------------------------------------------------------------------------------------


class ReactionSerializer(ModelSerializer):
    user = TinyUserSerializer(read_only=True)
    direct_message = TinyDirectMessageSerializer()
    comment = TinyCommentSerializer()

    class Meta:
        model = Reaction
        fields = "__all__"


class ReactionCreateSerializer(ModelSerializer):
    class Meta:
        model = Reaction
        fields = [
            "id",
            "user",
            "comment",
            "direct_message",
            "reaction",
            "created_at",
            "updated_at",
        ]


# endregion ====================================================================================================
