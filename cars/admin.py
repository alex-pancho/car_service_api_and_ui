from django.contrib import admin
from .models import Brand, CarModel, Car


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("id", "title")


@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "car_brand")


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "car_brand", "car_model", "mileage")
