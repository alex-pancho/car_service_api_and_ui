from rest_framework import serializers
from .models import Brand, CarModel, Car, Service

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id","title","logo_filename")

class CarModelSerializer(serializers.ModelSerializer):
    carBrandId = serializers.PrimaryKeyRelatedField(source="car_brand", queryset=Brand.objects.all())
    class Meta:
        model = CarModel
        fields = ("id","carBrandId","title")

class CarSerializer(serializers.ModelSerializer):
    carBrandId = serializers.PrimaryKeyRelatedField(source="car_brand", queryset=Brand.objects.all())
    carModelId = serializers.PrimaryKeyRelatedField(source="car_model", queryset=CarModel.objects.all())
    brand = serializers.CharField(source="car_brand.title", read_only=True)
    model = serializers.CharField(source="car_model.title", read_only=True)
    logo = serializers.CharField(source="car_brand.logo_filename", read_only=True)
    class Meta:
        model = Car
        fields = ("id","carBrandId","carModelId","initial_mileage","updated_mileage_at","mileage","brand","model","logo")

    def create(self, validated_data):
        user = self.context["request"].user
        car_brand = validated_data.pop("car_brand")
        car_model = validated_data.pop("car_model")
        mileage = validated_data.get("initial_mileage") or validated_data.get("mileage", 0)
        car = Car.objects.create(
            owner=user,
            car_brand=car_brand,
            car_model=car_model,
            initial_mileage=mileage,
            mileage=mileage,
            **{k:v for k,v in validated_data.items() if k not in ("initial_mileage","mileage")}
        )
        return car

    def update(self, instance, validated_data):
        # allow updating mileage and brand/model
        if "car_brand" in validated_data:
            instance.car_brand = validated_data["car_brand"]
        if "car_model" in validated_data:
            instance.car_model = validated_data["car_model"]
        if "mileage" in validated_data:
            instance.mileage = validated_data["mileage"]
        instance.save()
        return instance

class ServiceSerializer(serializers.ModelSerializer):
    car_info = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'car', 'car_info', 'work_description', 'hours', 
                  'status', 'scheduled_date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_car_info(self, obj):
        return f"{obj.car.car_brand.title} {obj.car.car_model.title}"