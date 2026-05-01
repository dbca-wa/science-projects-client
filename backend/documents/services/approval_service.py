"""
Approval service - Document approval workflow logic
"""

from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError

from ..models import ProjectDocument
from ..utils.helpers import sanitise_feedback_html
from .notification_service import NotificationService


class ApprovalService:
    """Business logic for document approval workflows"""

    @staticmethod
    @transaction.atomic
    def request_approval(document, requester):
        """
        Request approval for document

        Args:
            document: ProjectDocument instance
            requester: User requesting approval

        Raises:
            ValidationError: If document not ready for approval
        """
        if document.status != ProjectDocument.StatusChoices.INREVIEW:
            raise ValidationError(
                "Document must be in review before requesting approval"
            )

        settings.LOGGER.info(
            f"{requester} is requesting approval for document {document}"
        )

        document.status = ProjectDocument.StatusChoices.INAPPROVAL
        document.save()

        try:
            NotificationService.notify_document_ready(document, requester)
        except Exception as e:
            settings.LOGGER.error(
                f"Failed to send approval request notification: {e}", exc_info=True
            )

    @staticmethod
    @transaction.atomic
    def approve_stage_one(document, approver, send_notifications=True):
        """
        Approve document at stage 1 (project lead)

        Args:
            document: ProjectDocument instance
            approver: User approving the document
            send_notifications: Whether to send notification emails

        Raises:
            PermissionDenied: If user not authorised
        """
        # Check permission
        if not ApprovalService._can_approve_stage_one(document, approver):
            raise PermissionDenied("User not authorized to approve at stage 1")

        settings.LOGGER.info(f"{approver} is approving document {document} at stage 1")

        document.project_lead_approval_granted = True
        document.save()

        if send_notifications:
            try:
                NotificationService.notify_document_approved(document, approver)
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to send stage 1 approval notification: {e}", exc_info=True
                )

    @staticmethod
    @transaction.atomic
    def approve_stage_two(document, approver, send_notifications=True):
        """
        Approve document at stage 2 (business area lead)

        Args:
            document: ProjectDocument instance
            approver: User approving the document
            send_notifications: Whether to send notification emails

        Raises:
            PermissionDenied: If user not authorised
            ValidationError: If stage 1 not complete
        """
        # Check stage 1 complete
        if not document.project_lead_approval_granted:
            raise ValidationError("Stage 1 approval must be granted first")

        # Check permission
        if not ApprovalService._can_approve_stage_two(document, approver):
            raise PermissionDenied("User not authorized to approve at stage 2")

        settings.LOGGER.info(f"{approver} is approving document {document} at stage 2")

        document.business_area_lead_approval_granted = True
        document.save()

        if send_notifications:
            try:
                NotificationService.notify_document_approved(document, approver)
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to send stage 2 approval notification: {e}", exc_info=True
                )

    @staticmethod
    @transaction.atomic
    def approve_stage_three(document, approver, send_notifications=True):
        """
        Approve document at stage 3 (directorate) - final approval

        Args:
            document: ProjectDocument instance
            approver: User approving the document
            send_notifications: Whether to send notification emails

        Raises:
            PermissionDenied: If user not authorised
            ValidationError: If previous stages not complete
        """
        # Check previous stages complete
        if not document.project_lead_approval_granted:
            raise ValidationError("Stage 1 approval must be granted first")
        if not document.business_area_lead_approval_granted:
            raise ValidationError("Stage 2 approval must be granted first")

        # Check permission
        if not ApprovalService._can_approve_stage_three(document, approver):
            raise PermissionDenied("User not authorized to approve at stage 3")

        settings.LOGGER.info(
            f"{approver} is approving document {document} at stage 3 (final)"
        )

        document.directorate_approval_granted = True
        document.status = ProjectDocument.StatusChoices.APPROVED
        document.save()

        # Only set project to active if no approved closure exists
        # (a project with an approved closure should remain in its current terminal state)
        has_approved_closure = ProjectDocument.objects.filter(
            project=document.project,
            kind=ProjectDocument.CategoryKindChoices.PROJECTCLOSURE,
            status=ProjectDocument.StatusChoices.APPROVED,
        ).exists()

        if not has_approved_closure:
            document.project.status = "active"
            document.project.save()

        if send_notifications:
            try:
                NotificationService.notify_document_approved(document, approver)
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to send stage 3 approval notification: {e}", exc_info=True
                )

            try:
                NotificationService.notify_document_approved_directorate(
                    document, approver
                )
            except Exception as e:
                settings.LOGGER.error(
                    f"Failed to send directorate approval notification: {e}",
                    exc_info=True,
                )

    @staticmethod
    @transaction.atomic
    def send_back(document, sender, feedback_html=""):
        """
        Send document back for revision

        Resets approval flags based on the current stage:
        - Stage 2 (BA lead sends back): resets project_lead and business_area_lead
        - Stage 3 (directorate sends back): resets business_area_lead and directorate

        Args:
            document: ProjectDocument instance
            sender: User sending back the document
            feedback_html: Optional rich text HTML feedback (shown in email)
        """
        settings.LOGGER.info(f"{sender} is sending back document {document}")

        # Sanitise feedback HTML
        feedback_html = sanitise_feedback_html(feedback_html)

        # Determine current stage and reset appropriate flags
        # Fully approved: all flags granted — reset directorate to send back to stage 3
        if (
            document.project_lead_approval_granted
            and document.business_area_lead_approval_granted
            and document.directorate_approval_granted
        ):
            document.directorate_approval_granted = False
        # Stage 3 (directorate pending): BA lead granted, directorate not yet granted
        # Send back to stage 2: reset BA lead only, keep project lead
        elif (
            document.business_area_lead_approval_granted
            and not document.directorate_approval_granted
        ):
            document.business_area_lead_approval_granted = False
        # Stage 2 (BA lead pending): project lead granted, BA lead not yet granted
        # Send back to stage 1: reset project lead
        elif (
            document.project_lead_approval_granted
            and not document.business_area_lead_approval_granted
        ):
            document.project_lead_approval_granted = False

        document.status = ProjectDocument.StatusChoices.REVISING
        document.save()

        try:
            NotificationService.notify_document_sent_back(
                document, sender, feedback_html
            )
        except Exception as e:
            settings.LOGGER.error(
                f"Failed to send document sent back notification: {e}", exc_info=True
            )

    @staticmethod
    @transaction.atomic
    def recall(document, recaller, feedback_html=""):
        """
        Recall document from approval process

        Args:
            document: ProjectDocument instance
            recaller: User recalling the document
            feedback_html: Optional rich text HTML feedback (shown in email)
        """
        settings.LOGGER.info(f"{recaller} is recalling document {document}")

        # Sanitise feedback HTML
        feedback_html = sanitise_feedback_html(feedback_html)

        # Reset approval flags
        document.project_lead_approval_granted = False
        document.business_area_lead_approval_granted = False
        document.directorate_approval_granted = False
        document.status = ProjectDocument.StatusChoices.REVISING
        document.save()

        try:
            NotificationService.notify_document_recalled(
                document, recaller, feedback_html
            )
        except Exception as e:
            settings.LOGGER.error(
                f"Failed to send document recalled notification: {e}", exc_info=True
            )

    @staticmethod
    @transaction.atomic
    def batch_approve(documents, approver, stage, send_notifications=True):
        """
        Batch approve multiple documents

        Args:
            documents: List of ProjectDocument instances
            approver: User approving the documents
            stage: Approval stage (1, 2, or 3)
            send_notifications: Whether to send notification emails

        Returns:
            dict: Results with approved and failed documents
        """
        results = {
            "approved": [],
            "failed": [],
        }

        for document in documents:
            try:
                if stage == 1:
                    ApprovalService.approve_stage_one(
                        document, approver, send_notifications=send_notifications
                    )
                elif stage == 2:
                    ApprovalService.approve_stage_two(
                        document, approver, send_notifications=send_notifications
                    )
                elif stage == 3:
                    ApprovalService.approve_stage_three(
                        document, approver, send_notifications=send_notifications
                    )
                else:
                    raise ValidationError(f"Invalid stage: {stage}")

                results["approved"].append(document.pk)
            except (PermissionDenied, ValidationError) as e:
                results["failed"].append(
                    {
                        "document_id": document.pk,
                        "error": str(e),
                    }
                )

        return results

    @staticmethod
    def _can_approve_stage_one(document, user):
        """Check if user can approve at stage 1"""
        if user.is_superuser:
            return True
        return document.project.members.filter(user=user, is_leader=True).exists()

    @staticmethod
    def _can_approve_stage_two(document, user):
        """Check if user can approve at stage 2"""
        if user.is_superuser:
            return True
        return document.project.business_area.leader == user

    @staticmethod
    def _can_approve_stage_three(document, user):
        """Check if user can approve at stage 3 (directorate)"""
        if user.is_superuser:
            return True
        if not document.project.business_area.division:
            return False
        division = document.project.business_area.division
        # Director can approve
        if division.director == user:
            return True
        # Key stakeholder can approve
        if division.key_stakeholder == user:
            return True
        # Approvers can approve
        if division.approvers.filter(pk=user.pk).exists():
            return True
        return False

    @staticmethod
    def get_approval_stage(document):
        """
        Get current approval stage for document based on approval boolean flags.

        Args:
            document: ProjectDocument instance

        Returns:
            int: Current stage (1-3=stage number, 4=approved)
        """
        if not document.project_lead_approval_granted:
            return 1
        elif not document.business_area_lead_approval_granted:
            return 2
        elif not document.directorate_approval_granted:
            return 3
        else:
            return 4

    @staticmethod
    def get_next_approver(document):
        """
        Get next approver for document

        Args:
            document: ProjectDocument instance

        Returns:
            User instance or None
        """
        stage = ApprovalService.get_approval_stage(document)

        if stage == 1:
            # Get project lead
            leader_member = document.project.members.filter(is_leader=True).first()
            return leader_member.user if leader_member else None
        elif stage == 2:
            # Get business area leader
            return document.project.business_area.leader
        elif stage == 3:
            # Get key stakeholder, first approver, or director
            if document.project.business_area.division:
                division = document.project.business_area.division
                if division.key_stakeholder:
                    return division.key_stakeholder
                first_approver = division.approvers.first()
                if first_approver:
                    return first_approver
                return division.director

        return None
