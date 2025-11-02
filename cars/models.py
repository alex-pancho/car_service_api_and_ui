from django.db import models
from django.conf import settings

class Brand(models.Model):
    title = models.CharField(max_length=200)
    logo_filename = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.title

class CarModel(models.Model):
    car_brand = models.ForeignKey(Brand, related_name="models", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.car_brand.title} {self.title}"

class Car(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="cars", on_delete=models.CASCADE)
    car_brand = models.ForeignKey(Brand, on_delete=models.PROTECT)
    car_model = models.ForeignKey(CarModel, on_delete=models.PROTECT)
    initial_mileage = models.PositiveIntegerField()
    mileage = models.PositiveIntegerField()
    updated_mileage_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.owner} - {self.car_brand.title} {self.car_model.title}"
