"""
Custom middleware for the SPMS application.
"""


class MediaCacheMiddleware:
    """
    Set aggressive Cache-Control headers for media files served via /files/.

    Content-hashed filenames make files effectively immutable — the URL
    changes whenever the content changes — so browsers and proxies can
    cache them indefinitely.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/files/"):
            response["Cache-Control"] = "public, max-age=31536000, immutable"
        return response
