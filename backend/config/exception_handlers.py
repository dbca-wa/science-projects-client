"""
Custom DRF exception handling.
"""

from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import exception_handler as drf_exception_handler

from common.utils.file_validation import FileValidationError


def api_exception_handler(exc, context):
    """
    Extend DRF's default handler.

    File validation runs inside model.save(), which raises FileValidationError
    — a plain Exception that DRF does not recognise, so it surfaced as a 500
    with an HTML error page. A rejected upload is a client error, so it is
    translated to a 400 carrying the validation message.

    Args:
        exc: The exception raised
        context: DRF context (view, request, args, kwargs)

    Returns:
        Response, or None to let Django handle the exception
    """
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    if isinstance(exc, FileValidationError):
        return Response({"error": str(exc)}, status=HTTP_400_BAD_REQUEST)

    return None
