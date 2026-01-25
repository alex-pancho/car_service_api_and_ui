from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import (
    IsAuthenticated,
    BasePermission,
    SAFE_METHODS,
)
from rest_framework.exceptions import PermissionDenied

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiExample,
    OpenApiParameter,
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


# =========================
# Permissions
# =========================


class ReadOnlyOrAuthenticated(BasePermission):
    """
    GET/HEAD/OPTIONS — доступні всім
    POST/PUT/PATCH/DELETE — тільки авторизованим
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class IsOwnerPermission(BasePermission):
    """
    Доступ лише власнику обʼєкта
    """

    def has_object_permission(self, request, view, obj):
        return hasattr(obj, "owner") and obj.owner == request.user


# =========================
# Brands
# =========================


@extend_schema_view(
    list=extend_schema(
        summary="Список брендів",
        description="Публічний endpoint",
        examples=[
            OpenApiExample(
                "Brands list",
                value=[
                    {"id": 1, "title": "BMW", "logo_filename": "bmw.png"},
                    {"id": 2, "title": "Audi", "logo_filename": "audi.png"},
                ],
            )
        ],
    ),
    create=extend_schema(
        summary="Створити бренд (auth)",
    ),
)
class BrandViewSet(ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [ReadOnlyOrAuthenticated]


# =========================
# Car models
# =========================


@extend_schema_view(
    list=extend_schema(
        summary="Список моделей авто",
        parameters=[
            OpenApiParameter(
                name="brand",
                description="ID бренду",
                required=False,
                type=int,
            )
        ],
        examples=[
            OpenApiExample(
                "Models list",
                value=[
                    {"id": 1, "title": "X5", "car_brand": 1},
                    {"id": 2, "title": "X6", "car_brand": 1},
                ],
            )
        ],
    )
)
class CarModelViewSet(ModelViewSet):
    serializer_class = CarModelSerializer
    permission_classes = [ReadOnlyOrAuthenticated]

    def get_queryset(self):
        qs = CarModel.objects.select_related("car_brand")
        brand_id = self.request.query_params.get("brand")
        if brand_id:
            qs = qs.filter(car_brand_id=brand_id)
        return qs


# =========================
# Cars (тільки власні)
# =========================


@extend_schema_view(
    list=extend_schema(
        summary="Мої автомобілі",
    ),
    create=extend_schema(
        summary="Додати автомобіль",
        examples=[
            OpenApiExample(
                "Create car",
                value={
                    "car_brand": 1,
                    "car_model": 2,
                    "initial_mileage": 10000,
                    "mileage": 10500,
                },
            )
        ],
    ),
)
class CarViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwnerPermission]

    def get_queryset(self):
        return Car.objects.filter(owner=self.request.user).select_related(
            "car_brand", "car_model"
        )

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return CarReadSerializer
        return CarWriteSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# =========================
# Services
# =========================


@extend_schema_view(
    list=extend_schema(
        summary="Список сервісних робіт",
        parameters=[
            OpenApiParameter(
                name="car",
                description="ID автомобіля",
                required=False,
                type=int,
            )
        ],
    ),
    create=extend_schema(
        summary="Додати сервіс",
        examples=[
            OpenApiExample(
                "Create service",
                value={
                    "car": 1,
                    "title": "Oil change",
                    "mileage": 12000,
                    "price": 1500,
                },
            )
        ],
    ),
)
class ServiceViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Service.objects.select_related(
            "car",
            "car__car_brand",
            "car__car_model",
        ).filter(car__owner=self.request.user)

        car_id = self.request.query_params.get("car")
        if car_id:
            qs = qs.filter(car_id=car_id)

        return qs

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return ServiceReadSerializer
        return ServiceWriteSerializer

    def perform_create(self, serializer):
        car = serializer.validated_data["car"]
        if car.owner != self.request.user:
            raise PermissionDenied("You do not own this car")
        serializer.save()
