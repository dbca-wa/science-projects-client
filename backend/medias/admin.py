# region IMPORTS ==================================================

import os

from django import forms
from django.conf import settings
from django.contrib import admin, messages
from django.http import HttpResponseRedirect
from django.urls import path, reverse

from .models import (
    AECEndorsementPDF,
    AgencyImage,
    AnnualReportMedia,
    AnnualReportPDF,
    BusinessAreaPhoto,
    LegacyAnnualReportPDF,
    ProjectDocumentPDF,
    ProjectPhoto,
    ProjectPlanMethodologyPhoto,
    UserAvatar,
)

# endregion ==================================================


# region ADMIN CLASSES ==================================================


class AgencyImageAdminForm(forms.ModelForm):
    class Meta:
        model = AgencyImage
        fields = "__all__"

    file = forms.ImageField(required=True, label="Upload File")


@admin.register(AgencyImage)
class AgencyImageAdmin(admin.ModelAdmin):
    form = AgencyImageAdminForm
    list_display = (
        "pk",
        "agency",
        "file",
        "size_in_mb",
    )

    search_fields = [
        "agency__name",
    ]

    list_filter = [
        "agency",
    ]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = AgencyImage.objects.all()  # Get all ProjectPhoto instances
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")


@admin.register(ProjectDocumentPDF)
class ProjectDocumentPDFAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "file",
        "size_in_mb",
        "document",
        "project",
    ]

    search_fields = [
        "project__title",
    ]

    list_filter = [
        "project__status",
        "project__business_area",
    ]

    ordering = ["-pk"]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("document", "project")

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate pdf sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = ProjectDocumentPDF.objects.all()  # Get all ProjectPhoto instances
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} pdf sizes.")


@admin.register(AECEndorsementPDF)
class AECEndorsementPDFAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "endorsement",
        "file",
        "size_in_mb",
        "creator",
    ]

    search_fields = [
        "endorsement__project_plan__document__project__title",
        "creator__username",
    ]

    list_filter = [
        "creator",
    ]

    ordering = ["-pk"]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("endorsement", "creator")

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = AECEndorsementPDF.objects.all()  # Get all ProjectPhoto instances
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")


@admin.register(AnnualReportPDF)
class AnnualReportPDFAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "report",
        "file",
        "size_in_mb",
        "creator",
    ]

    search_fields = [
        "creator__username",
    ]

    list_filter = [
        "report",
    ]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("report", "creator")

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = AnnualReportPDF.objects.all()  # Get all ProjectPhoto instances
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")


@admin.register(LegacyAnnualReportPDF)
class LegacyAnnualReportPDFAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "year",
        "file",
        "size_in_mb",
        "creator",
    ]

    search_fields = [
        "creator__username",
    ]

    list_filter = [
        "year",
    ]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate file sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_items = (
            LegacyAnnualReportPDF.objects.all()
        )  # Get all ProjectPhoto instances
        for item in all_items:
            if item.file:
                item.size = item.file.size
                item.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} items.")


@admin.register(AnnualReportMedia)
class AnnualReportMediaAdmin(admin.ModelAdmin):
    list_display = [
        "report",
        "kind",
        "file",
        "size_in_mb",
        "uploader",
    ]

    search_fields = [
        "uploader__username",
    ]

    list_filter = [
        "report",
        "kind",
    ]

    ordering = ["report", "kind"]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("report", "uploader")

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = AnnualReportMedia.objects.all()  # Get all ProjectPhoto instances
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")


@admin.register(BusinessAreaPhoto)
class BusinessAreaPhotoAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "business_area",
        "file",
        "size_in_mb",
        "uploader",
    )

    search_fields = [
        "business_area__name",
        "uploader__username",
    ]

    list_filter = [
        "business_area",
    ]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = BusinessAreaPhoto.objects.all()  # Get all ProjectPhoto instances
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")


@admin.register(ProjectPhoto)
class ProjectPhotoAdmin(admin.ModelAdmin):
    change_list_template = "admin/medias/projectphoto/change_list.html"
    list_display = (
        "pk",
        "file",
        "size_in_mb",
        "project",
        "business_area",
        "uploader",
    )
    search_fields = ("project__title",)
    list_filter = ("project__business_area",)

    @admin.display(description="Business Area", ordering="project__business_area")
    def business_area(self, obj):
        return obj.project.business_area if obj.project else None

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    def get_queryset(self, request):
        qs = (
            super()
            .get_queryset(request)
            .select_related("project", "project__business_area")
        )
        pk_in = request.GET.get("pk__in")
        if pk_in:
            try:
                pk_list = [int(p) for p in pk_in.split(",") if p.strip()]
                qs = qs.filter(pk__in=pk_list)
            except (ValueError, TypeError):
                pass
        return qs

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = ProjectPhoto.objects.all()
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")

    def get_urls(self):
        custom_urls = [
            path(
                "find-corrupt/",
                self.admin_site.admin_view(self.find_corrupt_view),
                name="medias_projectphoto_find_corrupt",
            ),
            path(
                "clean-orphans/",
                self.admin_site.admin_view(self.clean_orphans_view),
                name="medias_projectphoto_clean_orphans",
            ),
        ]
        return custom_urls + super().get_urls()

    def find_corrupt_view(self, request):
        """Scan all project photos for corrupt/missing/zero-byte files."""
        JPEG_MAGIC = b"\xff\xd8\xff"
        PNG_MAGIC = b"\x89PNG"

        missing = []
        zero_byte = []
        null_filled = []
        bad_header = []
        bad_pks = []

        for photo in ProjectPhoto.objects.select_related("project").all():
            if not photo.file:
                continue

            label = f"pk={photo.pk} project={photo.project}"

            try:
                file_path = photo.file.path
            except (ValueError, AttributeError):
                missing.append(f"{label} (no path)")
                bad_pks.append(str(photo.pk))
                continue

            if not os.path.exists(file_path):
                missing.append(f"{label} ({photo.file.name})")
                bad_pks.append(str(photo.pk))
                continue

            file_size = os.path.getsize(file_path)
            if file_size == 0:
                zero_byte.append(f"{label} ({photo.file.name})")
                bad_pks.append(str(photo.pk))
                continue

            with open(file_path, "rb") as f:
                header = f.read(512)

            if header == b"\x00" * len(header):
                null_filled.append(
                    f"{label} ({photo.file.name}, {file_size} bytes — all nulls)"
                )
                bad_pks.append(str(photo.pk))
                continue

            if not (header[:3] == JPEG_MAGIC or header[:4] == PNG_MAGIC):
                bad_header.append(
                    f"{label} ({photo.file.name}, header: {header[:8].hex()})"
                )
                bad_pks.append(str(photo.pk))

        parts = []
        if missing:
            parts.append(f"Missing on disk ({len(missing)}): {'; '.join(missing)}")
        if zero_byte:
            parts.append(f"Zero-byte ({len(zero_byte)}): {'; '.join(zero_byte)}")
        if null_filled:
            parts.append(
                f"Null-filled/corrupt ({len(null_filled)}): {'; '.join(null_filled)}"
            )
        if bad_header:
            parts.append(
                f"Bad image header ({len(bad_header)}): {'; '.join(bad_header)}"
            )

        changelist_url = reverse("admin:medias_projectphoto_changelist")

        if parts:
            self.message_user(request, " | ".join(parts), level=messages.WARNING)
            pk_filter = ",".join(bad_pks)
            return HttpResponseRedirect(f"{changelist_url}?pk__in={pk_filter}")
        else:
            self.message_user(request, "All project photo files look healthy.")
            return HttpResponseRedirect(changelist_url)

    def clean_orphans_view(self, request):
        """Remove files in projects/ that have no matching DB record."""
        photos_dir = os.path.join(settings.MEDIA_ROOT, "projects")
        if not os.path.isdir(photos_dir):
            self.message_user(request, "projects/ directory not found.")
            return HttpResponseRedirect(reverse("admin:medias_projectphoto_changelist"))

        db_filenames = set(
            ProjectPhoto.objects.exclude(file="")
            .exclude(file__isnull=True)
            .values_list("file", flat=True)
        )
        db_basenames = {os.path.basename(f) for f in db_filenames}

        orphaned = []
        for filename in os.listdir(photos_dir):
            filepath = os.path.join(photos_dir, filename)
            if not os.path.isfile(filepath):
                continue
            if filename not in db_basenames:
                orphaned.append((filename, filepath))

        if not orphaned:
            self.message_user(request, "No orphaned project photo files found.")
            return HttpResponseRedirect(reverse("admin:medias_projectphoto_changelist"))

        deleted_count = 0
        for _filename, filepath in orphaned:
            try:
                os.remove(filepath)
                deleted_count += 1
            except OSError:
                pass

        self.message_user(
            request,
            f"Removed {deleted_count} orphaned file(s) out of {len(orphaned)} found.",
        )
        return HttpResponseRedirect(reverse("admin:medias_projectphoto_changelist"))


@admin.register(ProjectPlanMethodologyPhoto)
class ProjectPlanMethodologyPhotoAdmin(admin.ModelAdmin):
    list_display = (
        "pk",
        "file",
        "size_in_mb",
        "project_plan",
        "uploader",
    )

    search_fields = [
        "project_plan__document__project__title",
        "uploader__username",
    ]

    list_filter = [
        "project_plan",
    ]

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = (
            ProjectPlanMethodologyPhoto.objects.all()
        )  # Get all ProjectPhoto instances
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")


@admin.register(UserAvatar)
class UserAvatarAdmin(admin.ModelAdmin):
    change_list_template = "admin/medias/useravatar/change_list.html"
    list_display = (
        "pk",
        "file",
        "size_in_mb",
        "user",
    )
    search_fields = (
        "user__first_name",
        "user__last_name",
        "user__display_first_name",
        "user__display_last_name",
        "user__email",
        "user__username",
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        pk_in = request.GET.get("pk__in")
        if pk_in:
            try:
                pk_list = [int(p) for p in pk_in.split(",") if p.strip()]
                qs = qs.filter(pk__in=pk_list)
            except (ValueError, TypeError):
                pass
        return qs

    @admin.display(
        description="Size (MB)",
        ordering="size",
    )
    def size_in_mb(self, obj):
        if obj.size:
            return "{:.2f} MB".format(obj.size / (1024 * 1024))
        else:
            return "Unknown"

    actions = ["recalculate_photo_sizes"]

    @admin.action(description="Recalculate photo sizes")
    def recalculate_photo_sizes(self, request, selected):
        if len(selected) > 1:
            print("PLEASE SELECT ONLY ONE")
            return
        updated_count = 0
        all_photos = UserAvatar.objects.all()
        for photo in all_photos:
            if photo.file:
                photo.size = photo.file.size
                photo.save()
                updated_count += 1
        self.message_user(request, f"Successfully updated {updated_count} photos.")

    def get_urls(self):
        custom_urls = [
            path(
                "find-corrupt/",
                self.admin_site.admin_view(self.find_corrupt_view),
                name="medias_useravatar_find_corrupt",
            ),
            path(
                "clean-orphans/",
                self.admin_site.admin_view(self.clean_orphans_view),
                name="medias_useravatar_clean_orphans",
            ),
        ]
        return custom_urls + super().get_urls()

    def find_corrupt_view(self, request):
        """Scan all avatars for corrupt/missing/zero-byte files (read-only)."""
        JPEG_MAGIC = b"\xff\xd8\xff"
        PNG_MAGIC = b"\x89PNG"

        # Each category stores (pk, description) tuples
        missing = []
        zero_byte = []
        null_filled = []
        bad_header = []
        bad_pks = []

        for avatar in UserAvatar.objects.all():
            if not avatar.file:
                continue

            try:
                file_path = avatar.file.path
            except (ValueError, AttributeError):
                missing.append(f"pk={avatar.pk} user={avatar.user} (no path)")
                bad_pks.append(str(avatar.pk))
                continue

            if not os.path.exists(file_path):
                missing.append(
                    f"pk={avatar.pk} user={avatar.user} ({avatar.file.name})"
                )
                bad_pks.append(str(avatar.pk))
                continue

            file_size = os.path.getsize(file_path)
            if file_size == 0:
                zero_byte.append(
                    f"pk={avatar.pk} user={avatar.user} ({avatar.file.name})"
                )
                bad_pks.append(str(avatar.pk))
                continue

            with open(file_path, "rb") as f:
                header = f.read(512)

            if header == b"\x00" * len(header):
                null_filled.append(
                    f"pk={avatar.pk} user={avatar.user} "
                    f"({avatar.file.name}, {file_size} bytes — all nulls)"
                )
                bad_pks.append(str(avatar.pk))
                continue

            if not (header[:3] == JPEG_MAGIC or header[:4] == PNG_MAGIC):
                bad_header.append(
                    f"pk={avatar.pk} user={avatar.user} "
                    f"({avatar.file.name}, header: {header[:8].hex()})"
                )
                bad_pks.append(str(avatar.pk))

        parts = []
        if missing:
            parts.append(f"Missing on disk ({len(missing)}): {'; '.join(missing)}")
        if zero_byte:
            parts.append(f"Zero-byte ({len(zero_byte)}): {'; '.join(zero_byte)}")
        if null_filled:
            parts.append(
                f"Null-filled/corrupt ({len(null_filled)}): {'; '.join(null_filled)}"
            )
        if bad_header:
            parts.append(
                f"Bad image header ({len(bad_header)}): {'; '.join(bad_header)}"
            )

        changelist_url = reverse("admin:medias_useravatar_changelist")

        if parts:
            self.message_user(request, " | ".join(parts), level=messages.WARNING)
            # Filter the list to show only problematic avatars
            pk_filter = ",".join(bad_pks)
            return HttpResponseRedirect(f"{changelist_url}?pk__in={pk_filter}")
        else:
            self.message_user(request, "All avatar files look healthy.")
            return HttpResponseRedirect(changelist_url)

    def clean_orphans_view(self, request):
        """Remove files in user_avatars/ that have no matching DB record."""
        avatars_dir = os.path.join(settings.MEDIA_ROOT, "user_avatars")
        if not os.path.isdir(avatars_dir):
            self.message_user(request, "user_avatars/ directory not found.")
            return HttpResponseRedirect(reverse("admin:medias_useravatar_changelist"))

        db_filenames = set(
            UserAvatar.objects.exclude(file="")
            .exclude(file__isnull=True)
            .values_list("file", flat=True)
        )
        db_basenames = {os.path.basename(f) for f in db_filenames}

        orphaned = []
        for filename in os.listdir(avatars_dir):
            filepath = os.path.join(avatars_dir, filename)
            if not os.path.isfile(filepath):
                continue
            if filename not in db_basenames:
                orphaned.append((filename, filepath))

        if not orphaned:
            self.message_user(request, "No orphaned avatar files found.")
            return HttpResponseRedirect(reverse("admin:medias_useravatar_changelist"))

        deleted_count = 0
        for _filename, filepath in orphaned:
            try:
                os.remove(filepath)
                deleted_count += 1
            except OSError:
                pass

        self.message_user(
            request,
            f"Removed {deleted_count} orphaned file(s) out of {len(orphaned)} found.",
        )
        return HttpResponseRedirect(reverse("admin:medias_useravatar_changelist"))


# endregion ==================================================
