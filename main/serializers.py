from rest_framework import serializers
from django.core import exceptions
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
import django.contrib.auth.password_validation as validators
from django.conf import settings

# Create your serializers here.


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name',
                  'last_name', 'password', 'confirm_password')

    def validate_password(self, value):
        try:
            validators.validate_password(value)
        except exceptions.ValidationError:
            raise serializers.ValidationError("비밀번호")

        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("비밀번호")

        return data

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])
        user.save()
        return user


class AuthSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        self.user = authenticate(username=data['username'], password=data['password'])

        if self.user is None:
            raise serializers.ValidationError("비밀번호")

        return data
