from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .signup import SignupView
from .logout import LogoutView
from .me import MeView

urlpatterns = [
    path("auth/signup/", SignupView.as_view()),
    path("auth/signin/", TokenObtainPairView.as_view(), name="signin"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view()),
    path("users/me/", MeView.as_view()),
]
