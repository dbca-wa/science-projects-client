# region IMPORTS ====================================================================================================
from django.conf import settings
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.views import APIView

from users.models import User

from ..models import Division
from ..serializers import DivisionSerializer, TinyDivisionSerializer
from ..services.agency_service import AgencyService

# endregion  =================================================================================================


class Divisions(APIView):
    """List and create divisions"""

    def get(self, request):
        divisions = (
            Division.objects.select_related(
                "director",
                "approver",
                "key_stakeholder",
            )
            .prefetch_related(
                "approvers",
                "directorate_email_list",
            )
            .all()
        )
        serializer = TinyDivisionSerializer(divisions, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request):
        settings.LOGGER.info(f"{request.user} is posting a division")
        serializer = DivisionSerializer(data=request.data)

        if serializer.is_valid():
            division = serializer.save()
            return Response(
                TinyDivisionSerializer(division).data,
                status=HTTP_201_CREATED,
            )
        else:
            settings.LOGGER.error(f"{serializer.errors}")
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class DivisionDetail(APIView):
    """Retrieve, update, and delete division"""

    def get(self, request, pk):
        division = AgencyService.get_division(pk)
        serializer = DivisionSerializer(division)
        return Response(serializer.data, status=HTTP_200_OK)

    def put(self, request, pk):
        division = AgencyService.get_division(pk)
        settings.LOGGER.info(f"{request.user} is updating division {division}")

        serializer = DivisionSerializer(
            division,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            updated_division = serializer.save()
            return Response(
                TinyDivisionSerializer(updated_division).data,
                status=HTTP_202_ACCEPTED,
            )
        else:
            settings.LOGGER.error(f"{serializer.errors}")
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        division = AgencyService.get_division(pk)
        settings.LOGGER.info(f"{request.user} is deleting division {division}")
        division.delete()
        return Response(status=HTTP_204_NO_CONTENT)


class DivisionEmailList(APIView):
    """Manage division email list"""

    def get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            raise NotFound(f"User with pk {pk} not found")

    def get(self, request, pk):
        try:
            division = (
                Division.objects.select_related(
                    "director",
                    "approver",
                    "key_stakeholder",
                )
                .prefetch_related(
                    "approvers",
                    "directorate_email_list",
                )
                .get(pk=pk)
            )
        except Division.DoesNotExist:
            raise NotFound(f"Division {pk} not found")
        serializer = TinyDivisionSerializer(division)
        return Response(serializer.data)

    def post(self, request, pk):
        settings.LOGGER.info(
            f"{request.user} is updating division email list (pk={pk})"
        )
        division = AgencyService.get_division(pk)

        # Handle directorate email list (existing behaviour)
        if "usersList" in request.data:
            users_array = request.data.get("usersList", [])
            new_user_array = []
            for u in users_array:
                try:
                    user = self.get_user(u)
                    new_user_array.append(user)
                except NotFound as e:
                    settings.LOGGER.error(
                        f"User not found during email list update: {e}"
                    )
                    return Response(
                        {"error": "One or more users could not be found."},
                        status=HTTP_400_BAD_REQUEST,
                    )
            try:
                division.directorate_email_list.set(new_user_array)
            except Exception as e:
                settings.LOGGER.error(f"Error updating division email list: {e}")
                return Response(
                    {"error": "Failed to update email list. Please try again."},
                    status=HTTP_400_BAD_REQUEST,
                )

        # Handle key stakeholder update
        if "keyStakeholder" in request.data:
            ks_id = request.data.get("keyStakeholder")
            if ks_id is None:
                division.key_stakeholder = None
                division.save()
            else:
                try:
                    user = self.get_user(ks_id)
                except NotFound:
                    return Response(
                        {"error": "Key stakeholder user could not be found."},
                        status=HTTP_400_BAD_REQUEST,
                    )
                if not user.is_staff:
                    return Response(
                        {"error": "Only internal staff users can be key stakeholders."},
                        status=HTTP_400_BAD_REQUEST,
                    )
                division.key_stakeholder = user
                division.save()

        # Handle approvers update
        if "approversList" in request.data:
            approvers_ids = request.data.get("approversList", [])
            new_approvers = []
            for uid in approvers_ids:
                try:
                    user = self.get_user(uid)
                except NotFound:
                    return Response(
                        {"error": "One or more approver users could not be found."},
                        status=HTTP_400_BAD_REQUEST,
                    )
                if not user.is_staff:
                    return Response(
                        {"error": "Only internal staff users can be approvers."},
                        status=HTTP_400_BAD_REQUEST,
                    )
                new_approvers.append(user)
            division.approvers.set(new_approvers)

        # Re-fetch and return the updated division
        division = Division.objects.get(pk=pk)
        serializer = TinyDivisionSerializer(division)
        return Response(serializer.data, status=HTTP_202_ACCEPTED)
