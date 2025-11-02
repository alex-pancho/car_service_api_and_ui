from rest_framework import viewsets, permissions
from .models import Brand, CarModel, Car
from .serializers import BrandSerializer, CarModelSerializer, CarSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CarModelViewSet(viewsets.ModelViewSet):
    queryset = CarModel.objects.all()
    serializer_class = CarModelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # return cars only of the current user
        return Car.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save()
