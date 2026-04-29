"""
Signal handlers for comment notifications

Handles triggering email notifications when comments are created or updated.
"""

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from communications.models import Comment
from communications.utils.mention_utils import process_comment_mentions
from documents.services.notification_service import NotificationService


@receiver(post_save, sender=Comment)
def handle_comment_created(sender, instance, created, **kwargs):
    """
    Handle comment creation and trigger notifications

    When a new comment is created:
    1. Extract and validate @mentions
    2. Create CommentMention records
    3. Send mention notifications to mentioned users
    4. Send new comment notifications to project team (excluding mentioned users)

    Args:
        sender: Comment model class
        instance: Comment instance that was saved
        created: Boolean indicating if this is a new comment
        **kwargs: Additional signal arguments
    """
    # Only process new comments (not updates)
    if not created:
        return

    # Skip if comment is removed
    if instance.is_removed:
        return

    # Skip if no user (shouldn't happen, but defensive)
    if not instance.user:
        settings.LOGGER.warning(
            f"Comment {instance.pk} has no user, skipping notifications"
        )
        return

    # Skip if no document (shouldn't happen, but defensive)
    if not instance.document:
        settings.LOGGER.warning(
            f"Comment {instance.pk} has no document, skipping notifications"
        )
        return

    try:
        # Process mentions and get list of mentioned users
        mentioned_users = process_comment_mentions(instance)

        # Send mention notifications
        if mentioned_users:
            for mentioned_user in mentioned_users:
                try:
                    commenter_data = {
                        "name": f"{instance.user.display_first_name} {instance.user.display_last_name}",
                    }
                    mentioned_user_data = [
                        {
                            "id": mentioned_user.pk,
                            "name": mentioned_user.get_full_name(),
                            "email": mentioned_user.email,
                        }
                    ]
                    NotificationService.notify_comment_mention(
                        document_id=instance.document.pk,
                        project_id=instance.document.project.pk,
                        commenter_data=commenter_data,
                        mentioned_users=mentioned_user_data,
                        comment_content=instance.text,
                    )
                    settings.LOGGER.info(
                        f"Sent mention notification to {mentioned_user.get_full_name()} "
                        f"for comment {instance.pk}"
                    )
                except Exception as e:
                    # Log error but don't fail comment creation
                    settings.LOGGER.error(
                        f"Failed to send mention notification to "
                        f"{mentioned_user.get_full_name()}: {e}"
                    )

        # Send new comment notifications to project team (excluding mentioned users)
        try:
            NotificationService.notify_new_comment(
                document=instance.document,
                comment=instance,
                commenter=instance.user,
            )
        except Exception as e:
            settings.LOGGER.error(
                f"Failed to send new comment team notification for comment {instance.pk}: {e}"
            )

        settings.LOGGER.info(
            f"Processed notifications for comment {instance.pk} "
            f"({len(mentioned_users)} mentions)"
        )

    except Exception as e:
        # Log error but don't fail comment creation
        settings.LOGGER.error(
            f"Error processing comment notifications for comment {instance.pk}: {e}"
        )
