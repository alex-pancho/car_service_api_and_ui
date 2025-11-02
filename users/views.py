from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import SignupSerializer, UserSerializer, ProfileUpdateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

class SignupView(APIView):
    permission_classes = (permissions.AllowAny,)
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        data = {
            "status": "ok",
            "data": {
                "userId": user.id,
                "tokens": tokens
            }
        }
        return Response(data, status=status.HTTP_201_CREATED)

class CurrentUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({"status":"ok","data":serializer.data})

class ProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({"status":"ok","data":serializer.data})

    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        out = UserSerializer(request.user)
        return Response({"status":"ok","data":out.data})

# simple signout endpoint that invalidates refresh token (client should send refresh)
class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # requires simplejwt blacklist app if used
            except Exception:
                pass
        return Response({"status":"ok"})
