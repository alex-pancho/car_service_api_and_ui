from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiExample,
)

from .serializers import (
    SignupSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
)

User = get_user_model()


# =========================
# Utils
# =========================


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


# =========================
# Signup
# =========================


@extend_schema_view(
    post=extend_schema(
        summary="Реєстрація користувача",
        description="Створює нового користувача та повертає JWT токени",
        examples=[
            OpenApiExample(
                "Signup example",
                value={
                    "username": "john",
                    "email": "john@mail.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "password": "StrongPass123",
                    "repeatPassword": "StrongPass123",
                },
            )
        ],
    )
)
class SignupView(CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "status": "ok",
                "user": UserSerializer(user).data,
                "tokens": tokens,
            },
            status=status.HTTP_201_CREATED,
        )


# =========================
# Signin (JWT)
# =========================


@extend_schema(
    summary="Логін (JWT)",
    examples=[
        OpenApiExample(
            "Signin example",
            value={
                "username": "john",
                "password": "StrongPass123",
            },
        )
    ],
)
class SigninView(TokenObtainPairView):
    permission_classes = [AllowAny]


# =========================
# Current user
# =========================


@extend_schema(
    summary="Поточний користувач",
)
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(
            {
                "status": "ok",
                "data": serializer.data,
            }
        )


# =========================
# Profile
# =========================


@extend_schema_view(
    get=extend_schema(
        summary="Отримати профіль",
    ),
    put=extend_schema(
        summary="Оновити профіль",
        examples=[
            OpenApiExample(
                "Update profile",
                value={
                    "first_name": "Johnny",
                    "last_name": "Doe",
                    "email": "johnny@mail.com",
                },
            )
        ],
    ),
)
class ProfileView(RetrieveUpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(
            {
                "status": "ok",
                "data": serializer.data,
            }
        )

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        out = UserSerializer(request.user)
        return Response(
            {
                "status": "ok",
                "data": out.data,
            }
        )


# =========================
# Logout
# =========================


@extend_schema(
    summary="Вихід (blacklist refresh token)",
    examples=[
        OpenApiExample(
            "Logout example",
            value={
                "refresh": "REFRESH_TOKEN_HERE",
            },
        )
    ],
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        return Response(
            {"status": "ok"},
            status=status.HTTP_200_OK,
        )
