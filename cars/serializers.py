from rest_framework import serializers
from .models import Brand, CarModel, Car, Service

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "title", "logo_filename")

class CarModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarModel
        fields = ("id", "car_brand", "title")


class CarWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = (
            "id",
            "car_brand",
            "car_model",
            "initial_mileage",
            "mileage",
        )

class CarReadSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source="car_brand.title", read_only=True)
    model = serializers.CharField(source="car_model.title", read_only=True)
    logo = serializers.CharField(source="car_brand.logo_filename", read_only=True)

    class Meta:
        model = Car
        fields = (
            "id",
            "brand",
            "model",
            "logo",
            "initial_mileage",
            "mileage",
            "updated_mileage_at",
        )

class ServiceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = (
            "id",
            "car",
            "work_description",
            "hours",
            "scheduled_date",
            "status",
        )

class ServiceReadSerializer(serializers.ModelSerializer):
    car_info = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = "__all__"

    def get_car_info(self, obj):
        return {
            "id": obj.car.id,
            "brand": obj.car.car_brand.title,
            "model": obj.car.car_model.title,
        }
