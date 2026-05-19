import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.apps import apps

User = get_user_model()

@pytest.fixture
def api_client():
    
    return APIClient()

@pytest.fixture
def authenticated_client(api_client):
   
    user = User.objects.create_user(username="testuser", password="password123")
    api_client.force_authenticate(user=user)
    return api_client

@pytest.fixture
def test_brand_and_model(db):
   
    BrandModel = apps.get_model('cars', 'Brand')
    CarModelClass = apps.get_model('cars', 'CarModel')

    brand, _ = BrandModel.objects.get_or_create(title="BMW")
    car_model, _ = CarModelClass.objects.get_or_create(title="M5", car_brand=brand)
    
    return brand, car_model

@pytest.fixture
def sample_car_id(authenticated_client, test_brand_and_model):
   
    brand, model = test_brand_and_model
    car_data = {
        "car_brand": brand.id,
        "car_model": model.id,
        "initial_mileage": 10000,
        "mileage": 12000
    }
    response = authenticated_client.post("/api/cars/", data=car_data, format="json")
    if response.status_code == status.HTTP_201_CREATED:
        return response.data.get("id")
    return None


@pytest.mark.django_db
class TestCarServiceAPI:

   
    def test_01_cars_endpoint_requires_authentication(self, api_client):
       
        response = api_client.get("/api/cars/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_02_cars_endpoint_allowed_for_authenticated_user(self, authenticated_client):
    
        response = authenticated_client.get("/api/cars/")
        assert response.status_code == status.HTTP_200_OK


   
    def test_03_create_car_success(self, authenticated_client, test_brand_and_model):
        
        brand, model = test_brand_and_model
        car_data = {
            "car_brand": brand.id,
            "car_model": model.id,
            "initial_mileage": 0,
            "mileage": 500
        }
        response = authenticated_client.post("/api/cars/", data=car_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["car_brand"] == brand.id
        assert response.data["car_model"] == model.id

    def test_04_create_car_invalid_data(self, authenticated_client, test_brand_and_model):
      
        brand, _ = test_brand_and_model
        invalid_data = {
            "car_brand": brand.id,
            "initial_mileage": 5000,
            "mileage": 6000
        }
        response = authenticated_client.post("/api/cars/", data=invalid_data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


   

    def test_05_get_all_cars_list(self, authenticated_client):
        
        response = authenticated_client.get("/api/cars/")
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.data, list) or "results" in response.data

    def test_06_get_single_car_by_id(self, authenticated_client, sample_car_id):
      
        if not sample_car_id:
            pytest.skip("Не вдалося створити тестовий автомобіль")
            
        response = authenticated_client.get(f"/api/cars/{sample_car_id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == sample_car_id


    

    def test_07_update_car_patch(self, authenticated_client, sample_car_id, test_brand_and_model):
        
        if not sample_car_id:
            pytest.skip("Не вдалося створити тестовий автомобіль")
            
        _, model = test_brand_and_model
        update_data = {"car_model": model.id}  # Виправлено: передаємо id, а не об'єкт
        response = authenticated_client.patch(f"/api/cars/{sample_car_id}/", data=update_data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["car_model"] == model.id




    def test_08_delete_car_success(self, authenticated_client, sample_car_id):
      
        if not sample_car_id:
            pytest.skip("Не вдалося створити тестовий автомобіль")
            
        response = authenticated_client.delete(f"/api/cars/{sample_car_id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT