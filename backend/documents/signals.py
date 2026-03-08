"""
Document signals
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Endorsement, ProjectPlan


@receiver(post_save, sender=ProjectPlan)
def create_endorsement_for_project_plan(sender, instance, created, **kwargs):
    """
    Automatically create an Endorsement object when a ProjectPlan is created.
    This ensures that every ProjectPlan has an associated Endorsement.
    """
    if created:
        # Check if endorsement already exists (shouldn't happen, but be safe)
        if not Endorsement.objects.filter(project_plan=instance).exists():
            Endorsement.objects.create(
                project_plan=instance,
                ae_endorsement_required=False,
                ae_endorsement_provided=False,
                data_management="<p></p>",
                no_specimens="<p></p>",
            )
