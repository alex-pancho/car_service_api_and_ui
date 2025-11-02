from rest_framework import viewsets, permissions
from .models import Brand, CarModel, Car, Service
from .serializers import BrandSerializer, CarModelSerializer, CarSerializer, ServiceSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CarModelViewSet(viewsets.ModelViewSet):
    queryset = CarModel.objects.select_related('car_brand').all()
    serializer_class = CarModelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        brand_id = self.request.query_params.get('brand')
        if brand_id:
            queryset = queryset.filter(car_brand_id=brand_id)
        return queryset

class CarViewSet(viewsets.ModelViewSet):
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Car.objects.filter(owner=self.request.user).select_related(
            'car_brand', 'car_model', 'owner'
        )
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Service.objects.filter(car__owner=self.request.user).select_related(
            'car', 'car__car_brand', 'car__car_model'
        )
        car_id = self.request.query_params.get('car')
        if car_id:
            queryset = queryset.filter(car_id=car_id)
        return queryset