from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F
from rest_framework import serializers
from console.models import Console
from product.models import STAGES_OF_DEVELOPMENT_CHOICES, UNIT_CHOICES, UnitPrice
from order.models import ORDER_TYPE_CHOICES, Order, OrderItem
from customer.models import Customer

# Create your serializers here.


class OrderItemSerializer(serializers.Serializer):
    unit_price = serializers.IntegerField(required=True)
    species = serializers.CharField(required=True)
    breed = serializers.CharField(required=True)
    remark = serializers.CharField(allow_blank=True, required=False)
    min_size = serializers.FloatField(required=True)
    max_size = serializers.FloatField(required=True)
    stages_of_development = serializers.ChoiceField(required=True, choices=STAGES_OF_DEVELOPMENT_CHOICES)
    unit = serializers.ChoiceField(required=True, choices=UNIT_CHOICES)
    price = serializers.FloatField(required=True)
    quantity = serializers.IntegerField(required=True)


class CustomerSerializer(serializers.Serializer):
    customer_name = serializers.CharField(required=True)
    contact = serializers.CharField(required=True)
    address = serializers.CharField(required=True)


class OrderSerializer(serializers.Serializer):
    cart = OrderItemSerializer(many=True)
    recipient = CustomerSerializer()
    order_type = serializers.ChoiceField(required=True, choices=ORDER_TYPE_CHOICES)

    def set_FK(self, key):
        self.FK = key

    def get_customer(self, customer_name, contact, address):
        try:
            customer = Customer.objects.get(customer_name=customer_name, contact=contact, address=address, console=self.FK)
        except ObjectDoesNotExist:
            customer = None

        return customer

    def create(self, validated_data):
        cart = validated_data['cart']
        recipient = validated_data['recipient']
        
        customer = self.get_customer(recipient['customer_name'], recipient['contact'], recipient['address'])

        if customer is None:
            customer = Customer.objects.create(
                console=Console.objects.get(id=self.FK),
                customer_name=recipient['customer_name'],
                contact=recipient['contact'],
                address=recipient['address'],
            )
            customer.save()

        order = Order.objects.create(
            console=Console.objects.get(id=self.FK),
            customer=customer,
            customer_name=recipient['customer_name'],
            contact=recipient['contact'],
            address=recipient['address'],
            order_type=validated_data['order_type'],
        )

        for data in cart:
            order_item = OrderItem.objects.create(
                order=order,
                unit_price=UnitPrice.objects.get(id=data['unit_price']),
                species=data['species'],
                breed=data['breed'],
                min_size=data['min_size'],
                max_size=data['max_size'],
                stages_of_development=data['stages_of_development'],
                unit=data['unit'],
                price=data['price'],
                quantity=data['quantity'],
                remaining_order_quantity=data['quantity'],
            )
            unit_price = UnitPrice.objects.get(id=data['unit_price'])
            unit_price.order_quantity = F('order_quantity') + data['quantity']

            unit_price.save()
            order_item.save()

        order.save()

        return validated_data
