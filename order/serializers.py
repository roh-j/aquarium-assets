from django.core.exceptions import ObjectDoesNotExist
from django.db.models import F
from rest_framework import serializers
from console.models import Console
from product.models import UnitPrice
from order.models import ORDER_TYPE_CHOICES, Order, OrderItem
from customer.models import Customer

# Create your serializers here.


class OrderItemSerializer(serializers.ModelSerializer):
    order = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'order', 'unit_price', 'species', 'breed', 'remark', 'min_size',
                  'max_size', 'stages_of_development', 'unit', 'price', 'quantity', 'remaining_order_quantity',)


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)
    order_date = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_items', 'customer_name',
                  'contact', 'address', 'order_type', 'order_date',)

    def set_FK(self, key):
        self.FK = key

    def get_customer(self, customer_name, contact, address):
        try:
            customer = Customer.objects.get(customer_name=customer_name, contact=contact, address=address, console=self.FK)
        except ObjectDoesNotExist:
            customer = None

        return customer

    def create(self, validated_data):
        customer = self.get_customer(validated_data['customer_name'], validated_data['contact'], validated_data['address'])

        if customer is None:
            customer = Customer.objects.create(
                console=Console.objects.get(id=self.FK),
                customer_name=validated_data['customer_name'],
                contact=validated_data['contact'],
                address=validated_data['address'],
            )
            customer.save()

        order = Order.objects.create(
            console=Console.objects.get(id=self.FK),
            customer=customer,
            customer_name=validated_data['customer_name'],
            contact=validated_data['contact'],
            address=validated_data['address'],
            order_type=validated_data['order_type'],
        )

        for value in validated_data['order_items']:
            unit_price = value['unit_price']

            order_item = OrderItem.objects.create(
                order=order,
                unit_price=unit_price,
                species=value['species'],
                breed=value['breed'],
                min_size=value['min_size'],
                max_size=value['max_size'],
                stages_of_development=value['stages_of_development'],
                unit=value['unit'],
                price=value['price'],
                quantity=value['quantity'],
                remaining_order_quantity=value['quantity'],
            )
            unit_price.order_quantity = F('order_quantity') + value['quantity']

            unit_price.save()
            order_item.save()

        order.save()

        return order
