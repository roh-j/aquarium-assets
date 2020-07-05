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
    customer_name = serializers.CharField(allow_blank=True, required=False)
    contact = serializers.CharField(allow_blank=True, required=False)
    address = serializers.CharField(allow_blank=True, required=False)
    order_date = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'order_items', 'customer_name',
                  'contact', 'address', 'order_type', 'order_date',)

    def set_foreign_key(self, fk_console):
        self.fk_console = fk_console

    def get_customer(self, customer_name, contact, address):
        try:
            customer = Customer.objects.get(customer_name=customer_name, contact=contact, address=address, console=self.fk_console)
        except ObjectDoesNotExist:
            customer = None

        return customer

    def validate(self, data):
        if len(data['order_items']) == 0:
            raise serializers.ValidationError()
        return data

    def create(self, validated_data):
        if validated_data['customer_name'] != '' and validated_data['contact'] != '' and validated_data['address'] != '':
            customer = self.get_customer(validated_data['customer_name'], validated_data['contact'], validated_data['address'])

            if customer is None:
                customer = Customer.objects.create(
                    console=Console.objects.get(id=self.fk_console),
                    customer_name=validated_data['customer_name'],
                    contact=validated_data['contact'],
                    address=validated_data['address'],
                )
                customer.save()

            order = Order.objects.create(
                console=Console.objects.get(id=self.fk_console),
                customer=customer,
                customer_name=validated_data['customer_name'],
                contact=validated_data['contact'],
                address=validated_data['address'],
                order_type=validated_data['order_type'],
            )
        else:
            order = Order.objects.create(
                console=Console.objects.get(id=self.fk_console),
                customer_name=validated_data['customer_name'],
                contact=validated_data['contact'],
                address=validated_data['address'],
                order_type=validated_data['order_type'],
            )

        for validated_data_item in validated_data['order_items']:
            unit_price = validated_data_item['unit_price']

            order_item = OrderItem.objects.create(
                order=order,
                unit_price=unit_price,
                species=validated_data_item['species'],
                breed=validated_data_item['breed'],
                remark=validated_data_item['remark'],
                min_size=validated_data_item['min_size'],
                max_size=validated_data_item['max_size'],
                stages_of_development=validated_data_item['stages_of_development'],
                unit=validated_data_item['unit'],
                price=validated_data_item['price'],
                quantity=validated_data_item['quantity'],
                remaining_order_quantity=validated_data_item['quantity'],
            )
            unit_price.order_quantity = F('order_quantity') + validated_data_item['quantity']

            unit_price.save()
            order_item.save()

        order.save()

        return order
