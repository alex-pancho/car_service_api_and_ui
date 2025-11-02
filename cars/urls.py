from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, CarModelViewSet, CarViewSet

router = DefaultRouter()
router.register(r"brands", BrandViewSet, basename="brands")
router.register(r"models", CarModelViewSet, basename="models")
router.register(r"", CarViewSet, basename="cars")  # /api/cars/ -> list/create, /api/cars/{id}/

urlpatterns = [
    path("", include(router.urls)),
]
