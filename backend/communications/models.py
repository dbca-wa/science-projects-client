# region Imports ================================================================================================

from django.conf import settings
from django.db import models
from django.forms import ValidationError

from common.models import CommonModel
from documents.templatetags.custom_filters import extract_text_content

# endregion =================================================================================================

# region Models ================================================================================================


class ChatRoom(CommonModel):
    """
    Chat Room Model Definition
    """

    users = models.ManyToManyField(
        "users.User",
        related_name="chat_rooms",
    )

    def __str__(self) -> str:
        user_names = ", ".join(str(user) for user in self.users.all())
        return f"Chat Room - {user_names}"

    class Meta:
        verbose_name = "Chat Room"
        verbose_name_plural = "Chat Rooms"


class DirectMessage(CommonModel):
    """
    Chat Room Message Model Definition
    """

    text = models.TextField()
    user = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="messages",
    )
    chat_room = models.ForeignKey(
        "communications.ChatRoom",
        on_delete=models.CASCADE,
        related_name="messages",
    )
    ip_address = models.CharField(
        max_length=45,
        null=True,
        blank=True,
    )  # Will be sent from front-end
    is_public = models.BooleanField(default=True)
    is_removed = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"{self.user} says {self.text}"

    class Meta:
        verbose_name = "Direct Message"
        verbose_name_plural = "Direct Messages"


class Comment(CommonModel):
    """
    Model Definition for Comments on Project Documents

    Supports threaded replies via parent_comment field and @mentions tracking.
    """

    user = models.ForeignKey(
        "users.User",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
    )
    document = models.ForeignKey(
        "documents.ProjectDocument",
        on_delete=models.CASCADE,
        related_name="comments",
    )
    text = models.CharField(max_length=1500)
    ip_address = models.CharField(
        max_length=45,
        null=True,
        blank=True,
    )
    is_public = models.BooleanField(default=True)
    is_removed = models.BooleanField(default=False)

    # New fields for threaded replies (nullable for backward compatibility)
    parent_comment = models.ForeignKey(
        "self",
        related_name="replies",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Parent comment for threaded replies",
    )

    def get_reactions(self):
        try:
            return self.reactions.all()
        except Exception as e:
            settings.LOGGER.error(f"Error getting reactions: {e}")
            return None

    def __str__(self) -> str:
        return f"'{extract_text_content(self.text)}'"

    class Meta:
        verbose_name = "Comment"
        verbose_name_plural = "Comments"
        indexes = [
            models.Index(fields=["document", "-created_at"]),
            models.Index(fields=["user"]),
            models.Index(fields=["parent_comment"]),
        ]


class CommentMention(CommonModel):
    """
    Model Definition for Comment Mentions

    Tracks when users are @mentioned in comments for notification purposes.
    """

    comment = models.ForeignKey(
        "communications.Comment",
        related_name="mentions",
        on_delete=models.CASCADE,
        help_text="The comment containing the mention",
    )
    mentioned_user = models.ForeignKey(
        "users.User",
        related_name="comment_mentions",
        on_delete=models.CASCADE,
        help_text="The user who was mentioned",
    )

    class Meta:
        verbose_name = "Comment Mention"
        verbose_name_plural = "Comment Mentions"
        unique_together = [["comment", "mentioned_user"]]
        indexes = [
            models.Index(fields=["comment"]),
            models.Index(fields=["mentioned_user"]),
        ]

    def __str__(self) -> str:
        mentioned_name = self.mentioned_user.get_full_name()
        return f"@{mentioned_name} in comment {self.comment.pk}"


class Reaction(CommonModel):
    """
    Model definition for Reactions to Comments
    """

    class ReactionChoices(models.TextChoices):
        THUMBUP = "thumbup", "Thumbs Up"
        HEART = "heart", "Heart"
        FUNNY = "funny", "Funny"
        CONFUSED = "confused", "Confused"
        SURPRISED = "surprised", "Surprised"

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    comment = models.ForeignKey(
        "communications.Comment",
        on_delete=models.CASCADE,
        related_name="reactions",
        null=True,
        blank=True,
    )
    direct_message = models.ForeignKey(
        "communications.DirectMessage",
        on_delete=models.CASCADE,
        related_name="reactions",
        null=True,
        blank=True,
    )
    reaction = models.CharField(
        max_length=30,
        choices=ReactionChoices.choices,
    )

    # Ensures that either comment or direct_messages has a value, but not both
    def clean(self):
        if self.comment is None and self.direct_message is None:
            raise ValidationError(
                "A reaction must be associated with either a comment or a direct message."
            )
        if self.comment and self.direct_message:
            raise ValidationError(
                "A reaction cannot be associated with both a comment and a direct message."
            )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return (
            f"Reaction to {self.comment}"
            if self.comment
            else (
                f"Reaction to {self.direct_message}"
                if self.direct_message
                else "Reaction object null"
            )
        )

    class Meta:
        verbose_name = "Reaction"
        verbose_name_plural = "Reactions"


# endregion =================================================================================================
