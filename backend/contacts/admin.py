from django.contrib import admin

from .models import AgencyContact, BranchContact, UserContact


@admin.register(UserContact)
class UserContactAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "user",
        "email",
        "phone",
    ]

    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__username",
    ]

    list_filter = ["user__is_staff"]

    ordering = ["user__first_name"]


@admin.register(BranchContact)
class BranchContactAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "branch",
        "email",
        "phone",
    ]

    search_fields = [
        "branch__name",
    ]

    ordering = ["branch__name"]


@admin.register(AgencyContact)
class AgencyContactAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "agency",
        "email",
        "phone",
    ]

    search_fields = [
        "agency__name",
    ]

    ordering = ["agency__name"]
