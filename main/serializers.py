from rest_framework import serializers
from django.core import exceptions
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import django.contrib.auth.password_validation as validators
from main.models import MEMBERSHIP_CHOICES, Profile
from console.models import Console

# Create your serializers here.


class UserSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    membership = serializers.ChoiceField(required=True, write_only=True, choices=MEMBERSHIP_CHOICES)

    def validate_password(self, value):
        try:
            validators.validate_password(value)
        except exceptions.ValidationError:
            raise serializers.ValidationError()

        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError()

        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError()

        return data

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
        )

        user.set_password(validated_data['password'])

        profile = Profile.objects.create(
            user=user,
            membership=validated_data['membership'],
        )

        console = Console.objects.create(
            user=user
        )

        user.save()
        profile.save()
        console.save()

        return user


class AuthSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        self.user = authenticate(
            username=data['username'], password=data['password'])

        if self.user is None:
            raise serializers.ValidationError()

        return data
