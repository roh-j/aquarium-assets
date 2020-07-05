from rest_framework import serializers
from customer.models import Customer

# Create your serializers here.


class ListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Customer
        fields = ('id', 'customer_name', 'contact', 'address',)
