from django.core import exceptions
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
import django.contrib.auth.password_validation as validators
from rest_framework import serializers
from main.models import MEMBERSHIP_CHOICES, Profile
from console.models import Console

# Create your serializers here.


class UserSerializer(serializers.Serializer):
    membership = serializers.ChoiceField(
        required=True,
        write_only=True,
        choices=MEMBERSHIP_CHOICES,
    )
    username = serializers.CharField(
        required=True,
        error_messages={
            'blank': '사용자 계정을 입력해주세요.',
        },
    )
    email = serializers.EmailField(
        required=True,
        error_messages={
            'blank': '이메일 주소를 입력해주세요.',
            'invalid': '이메일 주소를 다시 확인해주세요.',
        },
    )
    first_name = serializers.CharField(
        required=True,
        error_messages={
            'blank': '성 (이름)을 입력해주세요.',
        },
    )
    last_name = serializers.CharField(
        required=True,
        error_messages={
            'blank': '이름을 입력해주세요.',
        },
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            'blank': '비밀번호를 입력해주세요.',
        },
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            'blank': '비밀번호 재확인을 입력해주세요.',
        },
    )

    def validate_username(self, value):
        try:
            User.objects.get(username=value)
        except ObjectDoesNotExist:
            return value

        raise serializers.ValidationError('이미 존재하는 계정입니다.')

    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except ObjectDoesNotExist:
            return value

        raise serializers.ValidationError('이미 사용중인 이메일 주소입니다.')

    def validate_password(self, value):
        try:
            validators.validate_password(value)
        except exceptions.ValidationError:
            raise serializers.ValidationError('문자, 숫자, 기호를 조합하여 8자 이상의 비밀번호를 입력해주세요.')

        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError('비밀번호가 일치하지 않습니다.')

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

        Profile.objects.create(
            user=user,
            membership=validated_data['membership'],
        )
        Console.objects.create(
            user=user
        )

        return user


class AuthSerializer(serializers.Serializer):
    username = serializers.CharField(
        write_only=True,
        error_messages={
            'blank': '사용자 계정을 입력해주세요.',
        },
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'blank': '비밀번호를 입력해주세요.',
        },
    )

    def validate(self, data):
        self.user = authenticate(username=data['username'], password=data['password'])

        if self.user is None:
            raise serializers.ValidationError('아이디 또는 비밀번호를 다시 확인하세요.')

        return data
