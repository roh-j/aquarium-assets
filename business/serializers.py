from rest_framework import serializers
from django.core import exceptions
from django.contrib.auth.models import User
from business.models import Business
from console.models import Console

# Create your serializers here.


class BusinessSerializer(serializers.ModelSerializer):
    registration_number = serializers.CharField(required=True)
    name_of_company = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    contact = serializers.CharField(required=True)
    alias = serializers.CharField(required=True)

    class Meta:
        model = Business
        fields = ('registration_number', 'name_of_company',
                  'address', 'contact', 'alias',)

    def set_foreign_key(self, key):
        self.FK = key

    def validate_registration_number(self, value):
        if Business.objects.filter(registration_number=value).exists():
            raise serializers.ValidationError()

        return value

    def validate_alias(self, value):
        if Business.objects.filter(alias=value).exists():
            raise serializers.ValidationError()

        return value

    def create(self, validated_data):
        business = Business.objects.create(
            user=User.objects.get(id=self.FK),
            registration_number=validated_data['registration_number'],
            name_of_company=validated_data['name_of_company'],
            address=validated_data['address'],
            contact=validated_data['contact'],
            alias=validated_data['alias'],
        )

        console = Console.objects.create(
            business=business
        )

        business.save()
        console.save()

        return business
