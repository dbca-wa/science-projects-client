# region IMPORTS ====================================================================================================
from django.contrib.auth import get_user_model
from rest_framework import serializers

from agencies.models import Agency, Branch
from agencies.serializers import TinyAgencySerializer, TinyBranchSerializer
from users.serializers import TinyUserSerializer

from .models import AgencyContact, BranchContact, UserContact

User = get_user_model()

# endregion ====================================================================================================

# region Serializers ====================================================================================================


class TinyUserContactSerializer(serializers.ModelSerializer):
    user = TinyUserSerializer(read_only=True)

    class Meta:
        model = UserContact
        fields = (
            "id",
            "user",
        )


class UserContactSerializer(serializers.ModelSerializer):
    user = TinyUserSerializer(read_only=True)

    class Meta:
        model = UserContact
        fields = "__all__"


class UserContactCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating user contacts"""

    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = UserContact
        fields = ["id", "user", "email", "phone", "alt_phone", "fax"]


class TinyAgencyContactSerializer(serializers.ModelSerializer):
    agency = TinyAgencySerializer(read_only=True)

    class Meta:
        model = AgencyContact
        fields = (
            "id",
            "agency",
            "email",
        )


class AgencyContactSerializer(serializers.ModelSerializer):
    agency = TinyAgencySerializer(read_only=True)

    class Meta:
        model = AgencyContact
        fields = "__all__"


class AgencyContactCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating agency contacts"""

    agency = serializers.PrimaryKeyRelatedField(queryset=Agency.objects.all())

    class Meta:
        model = AgencyContact
        fields = ["id", "agency", "email", "phone", "alt_phone", "fax"]


class TinyBranchContactSerializer(serializers.ModelSerializer):
    branch = TinyBranchSerializer(read_only=True)

    class Meta:
        model = BranchContact
        fields = [
            "id",
            "branch",
            "email",
        ]


class BranchContactSerializer(serializers.ModelSerializer):
    branch = TinyBranchSerializer(read_only=True)

    class Meta:
        model = BranchContact
        fields = "__all__"


class BranchContactCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating branch contacts"""

    branch = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all())

    class Meta:
        model = BranchContact
        fields = ["id", "branch", "email", "phone", "alt_phone", "fax"]


# endregion  =================================================================================================
