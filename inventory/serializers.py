from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, Subquery, F
from django.utils import timezone
from rest_framework import serializers
from console.models import Console
from store.models import Aquarium
from product.models import Creature, UnitPrice
from order.models import OrderItem
from inventory.models import GENDER_CHOICES, TRANSACTION_TYPE_CHOICES, DESCRIPTION_CHOICES, AquariumStock, StockLedger

# Create your serializers here.


class AquariumStockSerializer(serializers.Serializer):
    species = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            'blank': '어종을 입력해주세요.',
        },
    )
    breed = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            'blank': '품종을 입력해주세요.',
        },
    )
    remark = serializers.CharField(
        allow_blank=True,
        required=False,
    )
    gender = serializers.ChoiceField(
        required=True,
        choices=GENDER_CHOICES,
    )
    size = serializers.FloatField(
        required=True,
        error_messages={
            'blank': '크기를 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )
    quantity = serializers.IntegerField(
        required=True,
        error_messages={
            'blank': '마릿수를 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )

    def set_foreign_key(self, fk_console, fk_aquarium):
        self.fk_console = fk_console
        self.fk_aquarium = fk_aquarium

    def get_creature(self, species, breed, remark):
        try:
            creature = Creature.objects.get(species=species, breed=breed, remark=remark, console=self.fk_console)
        except ObjectDoesNotExist:
            creature = None

        return creature

    def validate(self, data):
        creature = self.get_creature(data['species'], data['breed'], data['remark'])

        if creature is not None:
            aquarium_stock = AquariumStock.objects.filter(
                console=Console.objects.get(id=self.fk_console),
                aquarium=Aquarium.objects.get(id=self.fk_aquarium),
                creature=creature,
                gender=data['gender'],
                size=data['size'],
            )

            if aquarium_stock.exists():
                raise serializers.ValidationError()

        return data

    def create(self, validated_data):
        creature = self.get_creature(validated_data['species'], validated_data['breed'], validated_data['remark'])

        if creature is None:
            creature = Creature.objects.create(
                console=Console.objects.get(id=self.fk_console),
                species=validated_data['species'],
                breed=validated_data['breed'],
                remark=validated_data['remark'],
            )
            creature.save()

        aquarium_stock = AquariumStock.objects.create(
            console=Console.objects.get(id=self.fk_console),
            aquarium=Aquarium.objects.get(id=self.fk_aquarium),
            creature=creature,
            gender=validated_data['gender'],
            size=validated_data['size'],
            quantity=validated_data['quantity'],
        )

        try:
            unit_price = UnitPrice.objects.get(
                Q(min_size__lte=validated_data['size']) & Q(max_size__gte=validated_data['size']),
                console=Console.objects.get(id=self.fk_console),
                creature=creature,
                unit=validated_data['gender'],
            )
        except ObjectDoesNotExist:
            unit_price = None

        if unit_price is not None:
            aquarium_stock.unit_price = unit_price

        aquarium_stock.save()

        return aquarium_stock


class GoodsIssueSerializer(serializers.Serializer):
    order_item = serializers.CharField(required=False)
    transaction_type = serializers.ChoiceField(required=True, choices=TRANSACTION_TYPE_CHOICES)
    description = serializers.ChoiceField(required=True, choices=DESCRIPTION_CHOICES)
    quantity = serializers.IntegerField(required=True)

    def set_foreign_key(self, fk_console, fk_aquarium):
        self.fk_console = fk_console
        self.fk_aquarium = fk_aquarium

    def validate(self, data):
        if (data['description'] == 'goods_sales'):
            if ('order_item' not in data):
                raise serializers.ValidationError('처리할 주문을 선택해주세요.')
        else:
            data['order_item'] = None

        return data

    def create(self, validated_data):
        stock_ledger = StockLedger.objects.create(
            console=Console.objects.get(id=self.fk_console),
            aquarium=Aquarium.objects.get(id=self.fk_aquarium),
            transaction_type=validated_data['transaction_type'],
            description=validated_data['description'],
            quantity=validated_data['quantity'],
        )

        if validated_data['order_item'] is not None:
            stock_ledger.order_item = OrderItem.objects.get(id=validated_data['order_item'])

            UnitPrice.objects.filter(
                id=Subquery(
                    OrderItem.objects.filter(
                        id=validated_data['order_item']
                    ).values_list('unit_price')[:1]
                )
            ).update(
                order_quantity=F('order_quantity') - validated_data['quantity']
            )
            
        return stock_ledger

class GoodsReceiptSerializer(serializers.Serializer):
    transaction_type = serializers.ChoiceField(required=True, choices=TRANSACTION_TYPE_CHOICES)
    description = serializers.ChoiceField(required=True, choices=DESCRIPTION_CHOICES)
    quantity = serializers.IntegerField(required=True)
    purchase_price = serializers.IntegerField(required=True)

    def set_foreign_key(self, fk_console, fk_aquarium):
        self.fk_console = fk_console
        self.fk_aquarium = fk_aquarium

    def validate(self, data):
        return data

    def create(self, validated_data):
        return validated_data
