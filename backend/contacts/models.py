# region IMPORTS ====================================================================================================
from django.db import models

from common.models import CommonModel

# endregion  =================================================================================================

# region Models ====================================================================================================


class UserContact(CommonModel):
    user = models.OneToOneField(
        "users.User",
        on_delete=models.CASCADE,
        related_name="contact",
    )
    email = models.EmailField(
        unique=True,
        blank=True,
        null=True,
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    alt_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    fax = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    def __str__(self) -> str:
        return f"{self.user_id} Contact"

    class Meta:
        verbose_name = "User Contact"
        verbose_name_plural = "User Contacts"


class AgencyContact(CommonModel):
    """
    Model definition for contact details of agency
    """

    agency = models.OneToOneField(
        "agencies.agency",
        on_delete=models.CASCADE,
        related_name="contact",
    )
    email = models.EmailField(
        blank=True,
        null=True,
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    alt_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    fax = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    def __str__(self) -> str:
        return f"{self.agency.name} Contact"

    class Meta:
        verbose_name = "agency Contact"
        verbose_name_plural = "agency Contacts"


class BranchContact(CommonModel):
    """
    Model definition for contact details of agency Branch
    """

    branch = models.OneToOneField(
        "agencies.Branch",
        on_delete=models.CASCADE,
        related_name="contact",
    )
    email = models.EmailField(
        blank=True,
        null=True,
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    alt_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    fax = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )

    def __str__(self) -> str:
        return f"{self.branch.name} Contact"

    class Meta:
        verbose_name = "Branch Contact"
        verbose_name_plural = "Branch Contacts"


# endregion  =================================================================================================
