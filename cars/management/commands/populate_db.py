"""
Django management command для заповнення бази даних мінімальними даними
Запусти: python manage.py populate_db
"""
import os
from django.core.management.base import BaseCommand
from users.models import User
from dotenv import load_dotenv

load_dotenv()

DJANGO_SUPERUSER_USERNAME = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
DJANGO_SUPERUSER_PASSWORD = os.getenv("DJANGO_SUPERUSER_PASSWORD", "password")
DJANGO_SUPERUSER_EMAIL = os.getenv("DJANGO_SUPERUSER_EMAIL", "email@gmail.com")

class Command(BaseCommand):
    help = 'Заповнює базу даних мінімальними тестовими даними'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Починаю заповнення бази даних...\n')

        # 1. Створи суперюзера, якщо його ще немає
        try:
            if not User.objects.filter(username=DJANGO_SUPERUSER_USERNAME).exists():
                User.objects.create_superuser(
                    username=DJANGO_SUPERUSER_USERNAME,
                    email=DJANGO_SUPERUSER_EMAIL,
                    password=DJANGO_SUPERUSER_PASSWORD
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Суперюзер {DJANGO_SUPERUSER_USERNAME} створений'))
            else:
                self.stdout.write(f'⚠ Суперюзер {DJANGO_SUPERUSER_USERNAME} вже існує')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Помилка при створенні суперюзера: {e}'))

        # 2. Заповни Brand, якщо модель існує
        try:
            from cars.models import Brand
            
            brands_data = [
                {'name': 'Toyota', 'country': 'Japan'},
                {'name': 'BMW', 'country': 'Germany'},
                {'name': 'Volkswagen', 'country': 'Germany'},
                {'name': 'Ford', 'country': 'USA'},
                {'name': 'Mazda', 'country': 'Japan'},
                {'name': 'Audi', 'country': 'Germany'},
                {'name': 'Honda', 'country': 'Japan'},
                {'name': 'Mercedes', 'country': 'Germany'},
            ]

            for brand_data in brands_data:
                brand, created = Brand.objects.get_or_create(
                    title=brand_data['name'],
                    #defaults={'country': brand_data.get('country', '')}
                )
                if created:
                    self.stdout.write(f'✓ Бренд "{brand.title}" створений')
                else:
                    self.stdout.write(f'⚠ Бренд "{brand.title}" вже існує')

            self.stdout.write(self.style.SUCCESS('\n✓ Бренди завантажені\n'))
        except ImportError:
            self.stdout.write(self.style.WARNING('⚠ Модель Brand не знайдена, пропускаю'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Помилка при завантаженні брендів: {e}'))

        # 3. Заповни CarModel, якщо модель існує
        try:
            from cars.models import CarModel, Brand
            
            models_data = [
                {'brand': 'Toyota', 'name': 'Camry', 'year': 2023},
                {'brand': 'Toyota', 'name': 'Corolla', 'year': 2022},
                {'brand': 'BMW', 'name': '3 Series', 'year': 2023},
                {'brand': 'BMW', 'name': '5 Series', 'year': 2022},
                {'brand': 'Volkswagen', 'name': 'Golf', 'year': 2023},
                {'brand': 'Volkswagen', 'name': 'Passat', 'year': 2022},
                {'brand': 'Ford', 'name': 'Mustang', 'year': 2023},
                {'brand': 'Mazda', 'name': 'CX-5', 'year': 2022},
                {'brand': 'Audi', 'name': 'A4', 'year': 2023},
                {'brand': 'Honda', 'name': 'Civic', 'year': 2022},
                {'brand': 'Mercedes', 'name': 'C-Class', 'year': 2023},
            ]

            for model_data in models_data:
                try:
                    brand = Brand.objects.get(title=model_data['brand'])
                    car_model, created = CarModel.objects.get_or_create(
                        title=model_data['name'],
                        car_brand=brand,
                        #defaults={'year': model_data.get('year', 2023)}
                    )
                    if created:
                        self.stdout.write(f'✓ Модель "{car_model.title}" ({brand.title}) створена')
                    else:
                        self.stdout.write(f'⚠ Модель "{car_model.title}" вже існує')
                except Brand.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'⚠ Бренд "{model_data["brand"]}" не знайдений'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'✗ Помилка при створенні моделі {model_data["name"]}: {e}'))

            self.stdout.write(self.style.SUCCESS('\n✓ Моделі авто завантажені\n'))
        except ImportError:
            self.stdout.write(self.style.WARNING('⚠ Модель CarModel не знайдена, пропускаю'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Помилка при завантаженні моделей: {e}'))

        self.stdout.write(self.style.SUCCESS('✅ База даних успішно заповнена!\n'))
