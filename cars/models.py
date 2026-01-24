from django.conf import settings
from django.db import models


class Brand(models.Model):
    title = models.CharField(max_length=100)
    logo_filename = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "Brand"
        verbose_name_plural = "Brands"

    def __str__(self):
        return self.title


class CarModel(models.Model):
    car_brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        related_name="models"
    )
    title = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Car model"
        verbose_name_plural = "Car models"
        unique_together = ("car_brand", "title")

    def __str__(self):
        return f"{self.car_brand} {self.title}"


class Car(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cars"
    )
    car_brand = models.ForeignKey(Brand, on_delete=models.PROTECT)
    car_model = models.ForeignKey(CarModel, on_delete=models.PROTECT)

    initial_mileage = models.PositiveIntegerField()
    mileage = models.PositiveIntegerField()
    updated_mileage_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Car"
        verbose_name_plural = "Cars"

    def __str__(self):
        return f"{self.car_brand} {self.car_model} ({self.owner})"


class Service(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Очікує"
        IN_PROGRESS = "in_progress", "В роботі"
        COMPLETED = "completed", "Виконано"

    car = models.ForeignKey(
        Car,
        on_delete=models.CASCADE,
        related_name="services"
    )
    work_description = models.CharField(max_length=255)
    hours = models.DecimalField(max_digits=4, decimal_places=1)
    scheduled_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"
        ordering = ("-scheduled_date",)

    def __str__(self):
        return f"{self.work_description} ({self.car})"
