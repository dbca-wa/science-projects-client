# region IMPORTS ====================================================================================================
import os

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import transaction
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_202_ACCEPTED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.views import APIView

from common.query_helpers import optimise_document_qs
from documents.models import ProjectDocument
from documents.serializers import ProjectDocumentSerializer
from documents.services.approval_service import ApprovalService
from medias.models import BusinessAreaPhoto
from projects.models import Project
from projects.serializers import ProblematicProjectSerializer

from ..models import BusinessArea
from ..serializers import BusinessAreaSerializer, TinyBusinessAreaSerializer
from ..services.agency_service import AgencyService

# endregion  =================================================================================================


class BusinessAreas(APIView):
    """List and create business areas"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        business_areas = AgencyService.list_business_areas()
        serializer = TinyBusinessAreaSerializer(business_areas, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def handle_ba_image(self, image):
        """Handle business area image upload"""
        if isinstance(image, dict):
            return image.get("file")
        if isinstance(image, str):
            return image
        elif image is not None:
            original_filename = image.name
            subfolder = "business_areas"
            file_path = f"{subfolder}/{original_filename}"

            if default_storage.exists(file_path):
                full_file_path = default_storage.path(file_path)
                if os.path.exists(full_file_path):
                    existing_file_size = os.path.getsize(full_file_path)
                    new_file_size = image.size
                    if existing_file_size == new_file_size:
                        return file_path

            content = ContentFile(image.read())
            file_path = default_storage.save(file_path, content)
            return file_path

    def post(self, request):
        settings.LOGGER.info(f"{request.user} is posting a business area")

        image = request.data.get("image")
        if image:
            if isinstance(image, str) and (
                image.startswith("http://") or image.startswith("https://")
            ):
                if not image.lower().endswith((".jpg", ".jpeg", ".png")):
                    return Response(
                        "The URL is not a valid photo file", status=HTTP_400_BAD_REQUEST
                    )

        division_id = request.data.get("division")
        ba_data = {
            "agency": request.data.get("agency"),
            "name": request.data.get("name"),
            "focus": request.data.get("focus"),
            "introduction": request.data.get("introduction"),
            "data_custodian": request.data.get("data_custodian"),
            "finance_admin": request.data.get("finance_admin"),
            "leader": request.data.get("leader"),
        }

        if division_id and division_id is not None:
            ba_data["division"] = int(division_id)

        serializer = BusinessAreaSerializer(data=ba_data)

        if serializer.is_valid():
            with transaction.atomic():
                new_business_area = serializer.save()

                try:
                    image_data = {
                        "file": self.handle_ba_image(image) if image else None,
                        "uploader": request.user,
                        "business_area": new_business_area,
                    }
                except ValueError as e:
                    settings.LOGGER.error(f"Error on handling BA image: {e}")
                    raise ValidationError(
                        {
                            "error": "Image processing failed. Please try a different file."
                        }
                    ) from e

                try:
                    BusinessAreaPhoto.objects.create(**image_data)
                except Exception as e:
                    settings.LOGGER.error(
                        f"Error on creating new BA Photo instance: {e}"
                    )
                    raise ValidationError(
                        {"error": "Failed to save image. Please try again."}
                    ) from e

                optimized_ba = BusinessArea.objects.select_related(
                    "division", "image"
                ).get(pk=new_business_area.pk)

                return Response(
                    TinyBusinessAreaSerializer(optimized_ba).data,
                    status=HTTP_201_CREATED,
                )
        else:
            settings.LOGGER.error(f"BA Serializer invalid: {serializer.errors}")
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class BusinessAreaDetail(APIView):
    """Retrieve, update, and delete business area"""

    permission_classes = [IsAuthenticated]

    def handle_ba_image(self, image):
        """Handle business area image upload"""
        if isinstance(image, dict):
            return image.get("file")
        if isinstance(image, str):
            return image
        elif image is not None:
            original_filename = image.name
            subfolder = "business_areas"
            file_path = f"{subfolder}/{original_filename}"

            if default_storage.exists(file_path):
                full_file_path = default_storage.path(file_path)
                if os.path.exists(full_file_path):
                    existing_file_size = os.path.getsize(full_file_path)
                    new_file_size = image.size
                    if existing_file_size == new_file_size:
                        return file_path

            content = ContentFile(image.read())
            file_path = default_storage.save(file_path, content)
            return file_path

    def get(self, request, pk):
        ba = AgencyService.get_business_area(pk)
        serializer = TinyBusinessAreaSerializer(ba)
        return Response(serializer.data, status=HTTP_200_OK)

    def put(self, request, pk):
        ba = AgencyService.get_business_area(pk)
        settings.LOGGER.info(f"{request.user} is updating business area {ba}")

        image = request.data.get("image")
        if image:
            if isinstance(image, str) and (
                image.startswith("http://") or image.startswith("https://")
            ):
                if not image.lower().endswith((".jpg", ".jpeg", ".png")):
                    return Response(
                        "The URL is not a valid photo file", status=HTTP_400_BAD_REQUEST
                    )
        else:
            selected_image_url = request.data.get("selectedImageUrl")
            if selected_image_url == "delete":
                photo = BusinessAreaPhoto.objects.filter(business_area=pk).first()
                if photo:
                    photo.delete()

        division_id = request.data.get("division")
        leader = request.data.get("leader")
        if leader == "0" or leader == 0:
            leader = None

        ba_data = {
            key: value
            for key, value in {
                "name": request.data.get("name"),
                "slug": request.data.get("slug"),
                "agency": request.data.get("agency"),
                "focus": request.data.get("focus"),
                "introduction": request.data.get("introduction"),
                "data_custodian": request.data.get("data_custodian"),
                "finance_admin": request.data.get("finance_admin"),
            }.items()
            if value is not None
        }

        # Only include leader if explicitly sent in the request
        # (prevents clearing leader when only updating image/name/introduction)
        if "leader" in request.data:
            ba_data["leader"] = leader

        if division_id is not None:
            try:
                ba_data["division"] = int(division_id)
            except (ValueError, TypeError):
                pass

        serializer = BusinessAreaSerializer(ba, data=ba_data, partial=True)

        if serializer.is_valid():
            with transaction.atomic():
                uba = serializer.save()

                if image:
                    try:
                        currentphoto = BusinessAreaPhoto.objects.get(business_area=pk)
                    except BusinessAreaPhoto.DoesNotExist:
                        image_data = {
                            "file": self.handle_ba_image(image),
                            "uploader": request.user,
                            "business_area": uba,
                        }
                        BusinessAreaPhoto.objects.create(**image_data)
                    else:
                        currentphoto.file = self.handle_ba_image(image)
                        currentphoto.save()

                return Response(
                    TinyBusinessAreaSerializer(uba).data,
                    status=HTTP_202_ACCEPTED,
                )
        else:
            settings.LOGGER.error(f"{serializer.errors}")
            return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        ba = AgencyService.get_business_area(pk)
        settings.LOGGER.info(f"{request.user} is deleting business area {ba}")
        ba.delete()
        return Response(status=HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        """Partial update — delegates to put (which already uses partial=True)"""
        return self.put(request, pk)


class MyBusinessAreas(APIView):
    """Get business areas led by current user (or all for superusers)"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_superuser:
            business_areas = BusinessArea.objects.all()
        else:
            business_areas = BusinessArea.objects.filter(leader=request.user.pk)

        business_areas = business_areas.select_related(
            "division", "image", "leader", "finance_admin", "data_custodian"
        )
        serializer = TinyBusinessAreaSerializer(business_areas, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class BusinessAreasUnapprovedDocs(APIView):
    """Get unapproved documents for business areas"""

    def get_unapproved_docs_for_ba(self, pk):
        try:
            docs = optimise_document_qs(
                ProjectDocument.objects.filter(
                    project__business_area=pk, directorate_approval_granted=False
                )
            ).distinct()
        except ProjectDocument.DoesNotExist:
            raise NotFound
        except Exception as e:
            settings.LOGGER.error(f"Error: {e}")
            docs = ProjectDocument.objects.none()
        return docs

    def post(self, request):
        try:
            pks_array = request.data.get("baArray")
            settings.LOGGER.info(
                f"{request.user} is Getting My BA Unapproved Docs: {pks_array}"
            )

            data = {}
            for ba_pk in pks_array:
                unapproved = self.get_unapproved_docs_for_ba(ba_pk)
                processed_unapproved = []
                seen_ids = set()
                unlinked_docs = []

                for item in unapproved:
                    if item.pk not in seen_ids:
                        if item.has_project_document_data() is False:
                            unlinked_docs.append(item)
                        else:
                            processed_unapproved.append(item)
                            seen_ids.add(item.pk)

                serializer = ProjectDocumentSerializer(processed_unapproved, many=True)
                serializer2 = ProjectDocumentSerializer(unlinked_docs, many=True)

                # Enrich linked docs with waiting_on information
                stage_role_map = {
                    1: "Project Lead",
                    2: "Business Area Lead",
                    3: "Directorate",
                }
                serialized_linked = serializer.data
                for doc_data, doc_obj in zip(serialized_linked, processed_unapproved):
                    stage = ApprovalService.get_approval_stage(doc_obj)
                    approver = ApprovalService.get_next_approver(doc_obj)
                    if approver:
                        doc_data["waiting_on"] = {
                            "id": approver.pk,
                            "display_first_name": approver.display_first_name,
                            "display_last_name": approver.display_last_name,
                            "role": stage_role_map.get(stage, "Unknown"),
                        }
                    else:
                        doc_data["waiting_on"] = None

                # Unlinked docs lack proper approval data
                serialized_unlinked = serializer2.data
                for doc_data in serialized_unlinked:
                    doc_data["waiting_on"] = None

                data[ba_pk] = {
                    "linked": serialized_linked,
                    "unlinked": serialized_unlinked,
                }

                if data[ba_pk]["linked"]:
                    ba_name = data[ba_pk]["linked"][0]["project"]["business_area"][
                        "name"
                    ]
                    settings.LOGGER.warning(
                        f"Unapproved Doc Count for BA '{ba_name}' ({ba_pk}): "
                        f"{len(processed_unapproved)}\nUnlinked Doc Count for BA {len(unlinked_docs)}"
                    )
                else:
                    settings.LOGGER.warning(
                        f"Unapproved Doc Count for BA {ba_pk}: {len(processed_unapproved)}\n"
                        f"Unlinked Doc Count for BA: {len(unlinked_docs)}"
                    )

            return Response(data=data, status=HTTP_200_OK)
        except Exception as e:
            settings.LOGGER.error(f"{e}")
            return Response(
                {"msg": "Failed to retrieve unapproved documents. Please try again."},
                HTTP_400_BAD_REQUEST,
            )


class BusinessAreasProblematicProjects(APIView):
    """Get problematic projects for business areas"""

    def get_projects_in_ba_array(self, ba_array):
        try:
            projects = (
                Project.objects.filter(
                    business_area__in=ba_array,
                    status__in=Project.ACTIVE_ONLY,
                )
                .select_related("business_area", "image")
                .prefetch_related("members", "members__user")
            )
        except Project.DoesNotExist:
            raise NotFound
        except Exception:
            settings.LOGGER.error(
                f"Failed to fetch projects for business areas {ba_array}",
                exc_info=True,
            )
            return Project.objects.none()
        return projects

    @staticmethod
    def _categorise_projects(projects):
        """Categorise projects by problem type.

        Uses the same detection logic as the admin ProblematicProjects view:
        - memberless: no members at all
        - no_leader: has members but no member with is_leader=True
          (EXCLUDES memberless projects — they're already in that list)
        - multiple_leads: more than one member with is_leader=True
        - external_leader: a member with is_leader=True whose user is not staff

        Safely handles orphaned ProjectMember rows where the related
        user no longer exists (RelatedObjectDoesNotExist).
        """
        memberless = []
        no_leader = []
        multiple_leaders = []
        externally_led = []

        for p in projects:
            members = p.members.all()
            member_count = len(members)

            # Memberless — skip further checks (don't double-count in no_leader)
            if member_count < 1:
                memberless.append(p)
                continue

            leader_count = 0
            external_leader = False

            for mem in members:
                try:
                    user = mem.user
                except Exception:  # nosec B112
                    settings.LOGGER.warning(
                        f"Orphaned ProjectMember pk={mem.pk} — related user missing",
                        exc_info=True,
                    )
                    continue
                if mem.is_leader:
                    leader_count += 1
                    if not user.is_staff:
                        external_leader = True

            if external_leader:
                externally_led.append(p)
            if leader_count == 0:
                no_leader.append(p)
            elif leader_count > 1:
                multiple_leaders.append(p)

        return {
            "no_members": memberless,
            "no_leader": no_leader,
            "external_leader": externally_led,
            "multiple_leads": multiple_leaders,
        }

    def get(self, request):
        try:
            business_area_id = request.query_params.get("business_area_id")
            if not business_area_id:
                return Response(
                    {"error": "business_area_id parameter is required"},
                    status=HTTP_400_BAD_REQUEST,
                )

            settings.LOGGER.info(
                f"{request.user} is Getting Problematic Projects for Business Area {business_area_id}"
            )

            all_projects = self.get_projects_in_ba_array([business_area_id])
            categorised = self._categorise_projects(all_projects)

            data = {
                key: ProblematicProjectSerializer(projects, many=True).data
                for key, projects in categorised.items()
            }

            return Response(data=data, status=HTTP_200_OK)

        except Exception as e:
            settings.LOGGER.error(f"{e}")
            return Response(
                {"msg": "Failed to retrieve problematic projects. Please try again."},
                status=HTTP_400_BAD_REQUEST,
            )

    def post(self, request):
        try:
            pks_array = request.data.get("baArray")
            settings.LOGGER.info(
                f"{request.user} is Getting My BA Problem Projects: {pks_array}"
            )
            data = {}

            for ba_pk in pks_array:
                projects_in_ba = Project.objects.filter(
                    business_area=ba_pk
                ).prefetch_related("members", "members__user")

                categorised = self._categorise_projects(projects_in_ba)

                data[ba_pk] = {
                    key: ProblematicProjectSerializer(projects, many=True).data
                    for key, projects in categorised.items()
                }

            return Response(data=data, status=HTTP_200_OK)

        except Exception as e:
            settings.LOGGER.error(f"{e}")
            return Response(
                {"msg": "Failed to retrieve problematic projects. Please try again."},
                HTTP_400_BAD_REQUEST,
            )


class SetBusinessAreaActive(APIView):
    """Toggle business area active status"""

    def post(self, request, pk):
        ba = AgencyService.get_business_area(pk)
        settings.LOGGER.info(f"{request.user} is changing active status of {ba}")

        try:
            updated_ba = AgencyService.set_business_area_active(pk)
            serializer = BusinessAreaSerializer(updated_ba)
            return Response(serializer.data, HTTP_202_ACCEPTED)
        except Exception as e:
            settings.LOGGER.error(f"Error setting active status of Business Area: {e}")
            return Response(
                {"error": "Failed to update business area status. Please try again."},
                HTTP_400_BAD_REQUEST,
            )
