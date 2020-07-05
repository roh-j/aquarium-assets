from django.core import exceptions
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from rest_framework import serializers
from business.models import Business
from console.models import Console

# Create your serializers here.


class BusinessSerializer(serializers.ModelSerializer):
    name_of_company = serializers.CharField(
        required=True,
        error_messages={
            'blank': '상호를 입력해주세요.',
        },
    )
    registration_number = serializers.CharField(
        required=True,
        error_messages={
            'blank': '사업자등록번호를 입력해주세요.',
        },
    )
    address = serializers.CharField(
        required=True,
        error_messages={
            'blank': '소재지를 입력해주세요.',
        },
    )
    contact = serializers.CharField(
        required=True,
        error_messages={
            'blank': '대표전화를 입력해주세요.',
        },
    )
    alias = serializers.CharField(
        required=True,
        error_messages={
            'blank': '매장 URL을 입력해주세요.',
        },
    )

    class Meta:
        model = Business
        fields = ('name_of_company', 'registration_number',
                  'address', 'contact', 'alias',)

    def set_foreign_key(self, fk_user):
        self.fk_user = fk_user

    def validate_registration_number(self, value):
        try:
            Business.objects.get(registration_number=value)
        except ObjectDoesNotExist:
            return value

        raise serializers.ValidationError('이미 등록된 사업자등록번호입니다.')

    def validate_alias(self, value):
        try:
            Business.objects.get(alias=value)
        except ObjectDoesNotExist:
            return value

        raise serializers.ValidationError('이미 사용중인 매장 URL입니다.')

    def create(self, validated_data):
        business = Business.objects.create(
            user=User.objects.get(id=self.fk_user),
            registration_number=validated_data['registration_number'],
            name_of_company=validated_data['name_of_company'],
            address=validated_data['address'],
            contact=validated_data['contact'],
            alias=validated_data['alias'],
        )

        Console.objects.create(
            business=business
        )

        return business
