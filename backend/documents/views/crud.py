"""
Document CRUD views - Base document operations
"""

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.views import APIView

from common.utils.pagination import paginate_queryset

from ..serializers import (
    ProjectDocumentCreateSerializer,
    ProjectDocumentSerializer,
    ProjectDocumentUpdateSerializer,
)
from ..services.document_service import DocumentService


class ProjectDocuments(APIView):
    """List and create project documents"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List project documents with filtering and pagination"""
        # Delegate to service
        documents = DocumentService.list_documents(
            user=request.user, filters=request.query_params
        )

        # Paginate
        paginated = paginate_queryset(documents, request)

        # Serialize
        serializer = ProjectDocumentSerializer(
            paginated["items"], many=True, context={"request": request}
        )

        return Response(
            {
                "documents": serializer.data,
                "total_results": paginated["total_results"],
                "total_pages": paginated["total_pages"],
            },
            status=HTTP_200_OK,
        )

    def post(self, request):
        """Create a new project document"""
        serializer = ProjectDocumentCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        kind = serializer.validated_data["kind"]
        project = serializer.validated_data["project"]

        # Use ClosureService for project closures
        if kind == "projectclosure":
            from ..services.closure_service import ClosureService

            # Create closure with additional data from request
            project_closure = ClosureService.create_closure(
                user=request.user, project=project, data=request.data
            )

            # Serialize and return the document
            result = ProjectDocumentSerializer(project_closure.document)
            return Response(result.data, status=HTTP_201_CREATED)

        # Delegate to service for other document types
        document = DocumentService.create_document(
            user=request.user,
            project=project,
            kind=kind,
        )

        # Serialize and return
        result = ProjectDocumentSerializer(document)
        return Response(result.data, status=HTTP_201_CREATED)


class ProjectDocumentDetail(APIView):
    """Get, update, and delete project documents"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Get project document by ID"""
        document = DocumentService.get_document(pk)
        serializer = ProjectDocumentSerializer(document)
        return Response(serializer.data, status=HTTP_200_OK)

    def put(self, request, pk):
        """Update project document"""
        serializer = ProjectDocumentUpdateSerializer(data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

        # Delegate to service
        document = DocumentService.update_document(
            pk=pk, user=request.user, data=serializer.validated_data
        )

        # Serialize and return
        result = ProjectDocumentSerializer(document)
        return Response(result.data, status=HTTP_200_OK)

    def delete(self, request, pk):
        """Delete project document"""
        DocumentService.delete_document(pk, request.user)
        return Response(status=HTTP_204_NO_CONTENT)


class ProjectDocsPendingMyAction(APIView):
    """Get documents pending user's action"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get documents pending approval by user"""
        stage = request.query_params.get("stage")

        # Delegate to service
        documents = DocumentService.get_documents_pending_action(
            user=request.user, stage=int(stage) if stage else None
        )

        # Serialize
        serializer = ProjectDocumentSerializer(
            documents, many=True, context={"request": request}
        )

        return Response(
            {
                "documents": serializer.data,
                "count": documents.count(),
            },
            status=HTTP_200_OK,
        )
