from django.contrib import admin, messages
from django.core.management import call_command

from .models import Caretaker


def migrate_caretaker_data_action(modeladmin, request, queryset):
    """
    Admin action to run the one-time caretaker data migration.

    This migrates data from adminoptions_caretaker to caretakers_caretaker.
    Safe to run multiple times (idempotent).
    """
    try:
        # Call the management command
        call_command("migrate_caretaker_data")
        messages.success(
            request,
            "Caretaker data migration completed successfully. Check server logs for details.",
        )
    except Exception as e:
        messages.error(request, f"Migration failed: {str(e)}")


migrate_caretaker_data_action.short_description = (
    "Migrate caretaker data from adminoptions (one-time)"
)


@admin.register(Caretaker)
class CaretakerAdmin(admin.ModelAdmin):
    list_display = ["user", "caretaker", "end_date", "created_at"]
    list_filter = ["end_date", "created_at"]
    search_fields = ["user__email", "caretaker__email", "reason"]
    raw_id_fields = ["user", "caretaker"]
    date_hierarchy = "created_at"
    actions = [migrate_caretaker_data_action]
