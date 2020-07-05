from rest_framework import serializers
from django.core import exceptions
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import django.contrib.auth.password_validation as validators

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
            raise serializers.ValidationError("입력오류")

        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("입력오류")

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
    error_messages = {
        'invalid': '유효한 문자열이 아닙니다.',
        'blank': '이 입력란은 비워둘 수 없습니다.',
        'max_length': '이 입력란의 길이가 {max_length} 이하 여야 합니다.',
        'min_length': '이 입력란의 길이가 {min_length} 이상인지 확인하십시오.'
    }

    username = serializers.CharField(
        error_messages=error_messages, required=True)
    password = serializers.CharField(
        error_messages=error_messages, required=True, write_only=True)

    def validate(self, data):
        self.user = authenticate(
            username=data['username'], password=data['password'])

        if self.user is None:
            raise serializers.ValidationError("아이디 또는 비밀번호를 다시 확인하세요.")

        return data
