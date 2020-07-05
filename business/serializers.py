from rest_framework import serializers
from django.core import exceptions
from django.contrib.auth.models import User
from django.conf import settings
from .models import Business
import datetime

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

    def set_FK(self, key):
        self.FK = key

    def create(self, validated_data):
        business = Business.objects.create(
            user=User.objects.get(pk=self.FK),
            registration_number=validated_data['registration_number'],
            name_of_company=validated_data['name_of_company'],
            address=validated_data['address'],
            contact=validated_data['contact'],
            alias=validated_data['alias'],
            publication_date=datetime.datetime.now(),
        )

        business.save()
        return business
