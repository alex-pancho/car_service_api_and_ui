from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    repeatPassword = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "repeatPassword",
        )
        extra_kwargs = {"email": {"required": True}, "username": {"required": True}}

    def validate(self, data):
        if data["password"] != data["repeatPassword"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        validate_password(data["password"], user=None)
        return data

    def create(self, validated_data):
        validated_data.pop("repeatPassword", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", allow_blank=True)
    lastName = serializers.CharField(source="last_name", allow_blank=True)
    photoFilename = serializers.CharField(source="photo_filename", read_only=True)
    dateBirth = serializers.DateField(
        source="date_birth", allow_null=True, required=False
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "name",
            "lastName",
            "photoFilename",
            "dateBirth",
            "country",
            "currency",
            "distance_units",
        )
        read_only_fields = ("id",)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", required=False, allow_blank=True)
    lastName = serializers.CharField(
        source="last_name", required=False, allow_blank=True
    )
    dateBirth = serializers.DateField(
        source="date_birth", required=False, allow_null=True
    )
    photo = serializers.CharField(write_only=True, required=False)  # placeholder

    class Meta:
        model = User
        fields = ("name", "lastName", "country", "dateBirth", "photo")
