from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import (
    AllowAny, IsAuthenticatedOrReadOnly, IsAuthenticated, BasePermission
)

from .models import Brand, CarModel, Car, Service
from .serializers import (
    BrandSerializer,
    CarModelSerializer,
    CarReadSerializer,
    CarWriteSerializer,
    ServiceReadSerializer,
    ServiceWriteSerializer,
)


class IsOwnerPermission(BasePermission):
    """
    Доступ лише власнику обʼєкта
    """

    def has_object_permission(self, request, view, obj):
        return hasattr(obj, "owner") and obj.owner == request.user


class BrandViewSet(ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]


class CarModelViewSet(ModelViewSet):
    serializer_class = CarModelSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = CarModel.objects.select_related("car_brand")
        brand_id = self.request.query_params.get("brand")
        if brand_id:
            queryset = queryset.filter(car_brand_id=brand_id)
        return queryset


class CarViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerPermission]

    def get_queryset(self):
        return (
            Car.objects
            .filter(owner=self.request.user)
            .select_related("car_brand", "car_model")
        )

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return CarReadSerializer
        return CarWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ServiceViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Service.objects
            .select_related("car", "car__car_brand", "car__car_model")
            .filter(car__owner=self.request.user)
        )

        car_id = self.request.query_params.get("car")
        if car_id:
            queryset = queryset.filter(car_id=car_id)

        return queryset

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return ServiceReadSerializer
        return ServiceWriteSerializer

    def perform_create(self, serializer):
        car = serializer.validated_data["car"]
        if car.owner != self.request.user:
            raise PermissionDenied("You do not own this car")
        serializer.save()
