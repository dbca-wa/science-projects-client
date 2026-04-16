from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.static import serve


# Exempt annual report PDF files from X-Frame-Options so the
# PrintPreviewTab iframe can load them cross-origin during development.
@xframe_options_exempt
def serve_embeddable(request, path, document_root=None):
    return serve(request, path, document_root=document_root)


def health_check(request):
    # Check database connection
    try:
        from django.db import connections

        connections["default"].cursor()
    except Exception as e:
        settings.LOGGER.error(f"Health check failed: {e}")
        return JsonResponse({"status": "fail"}, status=500)

    return JsonResponse({"status": "ok"}, status=200)


urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("admin/", admin.site.urls),
    # API routes - trailing slash required for include() to work properly
    # Django's include() concatenates: "api/v1/projects/" + "map" = "api/v1/projects/map"
    # Without trailing slash: "api/v1/projects" + "map" = "api/v1/projectsmap" (broken!)
    path("api/v1/users/", include("users.urls")),
    path("api/v1/agencies/", include("agencies.urls")),
    path("api/v1/contacts/", include("contacts.urls")),
    path("api/v1/communications/", include("communications.urls")),
    path("api/v1/medias/", include("medias.urls")),
    path("api/v1/projects/", include("projects.urls")),
    path("api/v1/documents/", include("documents.urls")),
    path("api/v1/quotes/", include("quotes.urls")),
    path("api/v1/locations/", include("locations.urls")),
    path("api/v1/categories/", include("categories.urls")),
    path("api/v1/adminoptions/", include("adminoptions.urls")),
    path("api/v1/caretakers/", include("caretakers.urls")),
    # Annual report PDFs — exempt from X-Frame-Options for iframe preview
    re_path(
        r"^files/annual_reports/pdfs/(?P<path>.*)$",
        serve_embeddable,
        {"document_root": settings.MEDIA_ROOT + "/annual_reports/pdfs"},
    ),
    re_path(r"^files/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
] + static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT,
)
