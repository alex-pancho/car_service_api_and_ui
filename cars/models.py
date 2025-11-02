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
    price_usd = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.owner} - {self.car_brand.title} {self.car_model.title}"

class Service(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Очікує'),
        ('in_progress', 'В роботі'),
        ('completed', 'Виконано'),
    ]
    
    car = models.ForeignKey(Car, related_name="services", on_delete=models.CASCADE)
    work_description = models.CharField(max_length=500)
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    scheduled_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    price_usd = models.PositiveIntegerField(default=100)
    
    def __str__(self):
        return f"{self.car} - {self.work_description}"
