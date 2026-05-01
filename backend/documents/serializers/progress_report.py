"""
Progress report serializers
"""

from rest_framework import serializers

from common.utils.mixins import TeamMemberMixin

from ..models import ProgressReport
from .base import TinyProjectDocumentSerializer


class TinyProgressReportSerializer(serializers.ModelSerializer):
    """Minimal progress report serializer"""

    document = TinyProjectDocumentSerializer(read_only=True)

    class Meta:
        model = ProgressReport
        fields = [
            "id",
            "document",
            "year",
            "context",
            "aims",
            "progress",
            "implications",
            "future",
        ]


class ProgressReportSerializer(TeamMemberMixin, serializers.ModelSerializer):
    """Standard progress report serializer"""

    document = TinyProjectDocumentSerializer(read_only=True)
    team_members = serializers.SerializerMethodField()

    class Meta:
        model = ProgressReport
        fields = "__all__"


class ProgressReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating progress reports"""

    class Meta:
        model = ProgressReport
        fields = [
            "document",
            "project",
            "report",
            "year",
            "context",
            "aims",
            "progress",
            "implications",
            "future",
        ]


class ProgressReportUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating progress reports"""

    class Meta:
        model = ProgressReport
        fields = [
            "context",
            "aims",
            "progress",
            "implications",
            "future",
        ]
