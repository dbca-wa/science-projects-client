from django.contrib import admin

from .models import Address, AgencyContact, BranchContact, UserContact


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = [
        "street",
        "state",
        "country",
        "agency",
        "branch",
    ]

    search_fields = ["street", "branch__name", "agency__name", "city", "state"]

    list_filter = ["state", "country"]


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
        "display_address",
    ]

    search_fields = [
        "branch__name",
    ]

    ordering = ["branch__name"]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("branch", "address")

    @admin.display(description="Address")
    def display_address(self, obj):
        if obj.address:
            return f"{obj.address.street}"
        return None


@admin.register(AgencyContact)
class AgencyContactAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "agency",
        "email",
        "phone",
        "address",
    ]

    search_fields = [
        "agency__name",
    ]

    ordering = ["agency__name"]
