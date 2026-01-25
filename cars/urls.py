from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BrandViewSet, CarModelViewSet, CarViewSet, ServiceViewSet

router = DefaultRouter()
router.register("cars", CarViewSet, basename="cars")
router.register("brands", BrandViewSet, basename="brands")
router.register("models", CarModelViewSet, basename="models")
router.register("services", ServiceViewSet, basename="services")

urlpatterns = [
    path("", include(router.urls)),
]
