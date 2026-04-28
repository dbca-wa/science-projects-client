"""
Document approval workflow views
"""

from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_202_ACCEPTED, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView

from ..serializers import ProjectDocumentSerializer
from ..services.approval_service import ApprovalService
from ..services.document_service import DocumentService


class DocApproval(APIView):
    """
    Approve document at specified stage

    Original API contract: POST with stage and documentPk in body
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Approve document at specified stage"""
        # Validate request data
        stage = request.data.get("stage")
        document_pk = request.data.get("documentPk")
        settings.LOGGER.info(f"{request.user} is approving document at stage {stage}")

        if not stage or not document_pk:
            return Response(
                {"error": "stage and documentPk are required"},
                status=HTTP_400_BAD_REQUEST,
            )

        try:
            stage = int(stage)
        except (ValueError, TypeError):
            return Response(
                {"error": "stage must be an integer"}, status=HTTP_400_BAD_REQUEST
            )

        # Get document
        document = DocumentService.get_document(document_pk)

        # Delegate to service based on stage
        if stage == 1:
            ApprovalService.approve_stage_one(document, request.user)
        elif stage == 2:
            ApprovalService.approve_stage_two(document, request.user)
        elif stage == 3:
            ApprovalService.approve_stage_three(document, request.user)
        else:
            return Response(
                {"error": f"Invalid stage: {stage}"}, status=HTTP_400_BAD_REQUEST
            )

        # Serialize and return
        serializer = ProjectDocumentSerializer(document)
        return Response(serializer.data, status=HTTP_202_ACCEPTED)


class DocRecall(APIView):
    """
    Recall document from approval process

    Original API contract: POST with stage and documentPk in body
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Recall document"""
        settings.LOGGER.info(f"{request.user} is recalling document")
        # Validate request data
        stage = request.data.get("stage")
        document_pk = request.data.get("documentPk")
        # Single rich text field serves as both reason and email feedback
        feedback_html = request.data.get("feedbackHTML", "") or request.data.get(
            "reason", ""
        )

        if not stage or not document_pk:
            return Response(
                {"error": "stage and documentPk are required"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Get document
        document = DocumentService.get_document(document_pk)

        # Delegate to service
        ApprovalService.recall(document, request.user, feedback_html)

        # Serialize and return
        serializer = ProjectDocumentSerializer(document)
        return Response(serializer.data, status=HTTP_202_ACCEPTED)


class DocSendBack(APIView):
    """
    Send document back for revision

    Original API contract: POST with stage and documentPk in body
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Send document back for revision"""
        settings.LOGGER.info(f"{request.user} is sending document back")
        # Validate request data
        stage = request.data.get("stage")
        document_pk = request.data.get("documentPk")
        # Single rich text field serves as both reason and email feedback
        feedback_html = request.data.get("feedbackHTML", "") or request.data.get(
            "reason", ""
        )

        if not stage or not document_pk:
            return Response(
                {"error": "stage and documentPk are required"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Get document
        document = DocumentService.get_document(document_pk)

        # Delegate to service
        ApprovalService.send_back(document, request.user, feedback_html)

        # Serialize and return
        serializer = ProjectDocumentSerializer(document)
        return Response(serializer.data, status=HTTP_202_ACCEPTED)


class BatchApprove(APIView):
    """Batch approve multiple documents"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Batch approve documents"""
        settings.LOGGER.warning(f"{request.user} is batch approving documents")
        document_ids = request.data.get("document_ids", [])
        stage = request.data.get("stage")

        if not document_ids or not stage:
            return Response(
                {"error": "document_ids and stage are required"},
                status=HTTP_400_BAD_REQUEST,
            )

        # Get documents
        documents = [DocumentService.get_document(doc_id) for doc_id in document_ids]

        # Delegate to service
        results = ApprovalService.batch_approve(
            documents=documents, approver=request.user, stage=int(stage)
        )

        return Response(results, status=HTTP_200_OK)
