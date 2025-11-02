from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # AbstractUser already has first_name, last_name, email, username, password
    # We'll add extra fields used in the OpenAPI:
    photo_filename = models.CharField(max_length=255, default="default-user.png", blank=True)
    date_birth = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    # settings
    currency = models.CharField(max_length=10, choices=[
        ("eur","EUR"),("gbp","GBP"),("usd","USD"),("uah","UAH"),("pln","PLN")
    ], default="usd")
    distance_units = models.CharField(max_length=2, choices=[("km","km"),("ml","ml")], default="km")

    def __str__(self):
        return self.username or self.email or f"User {self.pk}"
