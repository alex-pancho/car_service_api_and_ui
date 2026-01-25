from django.contrib import admin
from django.urls import path, include

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


urlpatterns = [
    path("", include("frontend.urls")),
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls_auth")),
    path("api/users/", include("users.urls")),
    path("api/", include("cars.urls")),

    # OpenAPI 3 (Swagger)
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]
