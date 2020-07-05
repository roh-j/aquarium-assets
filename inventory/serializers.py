from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q, F, Subquery, Sum, Case, When, Value, CharField
from django.utils import timezone
from rest_framework import serializers
from console.models import Console
from store.models import Aquarium
from product.models import Creature, UnitPrice
from order.models import Order, OrderItem
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
    transaction_type = serializers.ChoiceField(
        write_only=True,
        required=True,
        choices=TRANSACTION_TYPE_CHOICES,
    )
    description = serializers.ChoiceField(
        write_only=True,
        required=True,
        choices=DESCRIPTION_CHOICES,
    )
    purchase_price = serializers.IntegerField(
        write_only=True,
        required=False,
        error_messages={
            'blank': '출고 수량을 입력해주세요.',
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

    def get_aquarium(self):
        self.aquarium = Aquarium.objects.get(id=self.fk_aquarium)

    def validate(self, data):
        creature = self.get_creature(data['species'], data['breed'], data['remark'])
        self.get_aquarium()

        if creature is not None:
            aquarium_stock = AquariumStock.objects.filter(
                console=Console.objects.get(id=self.fk_console),
                aquarium=self.aquarium,
                creature=creature,
                gender=data['gender'],
                size=data['size'],
            )

            if aquarium_stock.exists():
                raise serializers.ValidationError('재고가 이미 존재합니다.')

        return data

    def create(self, validated_data):
        if (self.aquarium.is_empty == True):
            self.aquarium.is_empty = False
            self.aquarium.save()

        creature = self.get_creature(validated_data['species'], validated_data['breed'], validated_data['remark'])

        if creature is None:
            creature = Creature.objects.create(
                console=Console.objects.get(id=self.fk_console),
                species=validated_data['species'],
                breed=validated_data['breed'],
                remark=validated_data['remark'],
            )

        aquarium_stock = AquariumStock.objects.create(
            console=Console.objects.get(id=self.fk_console),
            aquarium=self.aquarium,
            creature=creature,
            gender=validated_data['gender'],
            size=validated_data['size'],
            quantity=validated_data['quantity'],
        )
        
        ledger_value = AquariumStock.objects.select_related('aquarium').annotate(
            storage_room_name=F('aquarium__aquarium_section__storage_room__storage_room_name'),
            section_name=F('aquarium__aquarium_section__section_name'),
            aquarium_row=F('aquarium__row'),
            aquarium_column=F('aquarium__column'),
        ).get(id=aquarium_stock.id)

        stock_ledger = StockLedger.objects.create(
            console=Console.objects.get(id=self.fk_console),
            aquarium=self.aquarium,
            storage_room_name=ledger_value.storage_room_name,
            section_name=ledger_value.section_name,
            aquarium_row=ledger_value.aquarium_row,
            aquarium_column=ledger_value.aquarium_column,
            species=validated_data['species'],
            breed=validated_data['breed'],
            remark=validated_data['remark'],
            size=validated_data['size'],
            transaction_type=validated_data['transaction_type'],
            description=validated_data['description'],
            quantity=validated_data['quantity'],
        )

        if ('purchase_price' in validated_data):
            stock_ledger.purchase_price = validated_data['purchase_price']
            stock_ledger.save()

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
    quantity = serializers.IntegerField(
        required=True,
        error_messages={
            'blank': '출고 수량을 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )

    def set_foreign_key(self, fk_console, fk_aquarium, fk_aquarium_stock):
        self.fk_console = fk_console
        self.fk_aquarium = fk_aquarium
        self.fk_aquarium_stock = fk_aquarium_stock

    def get_aquarium(self):
        self.aquarium = Aquarium.objects.get(id=self.fk_aquarium)

    def get_aquarium_stock(self):
        self.aquarium_stock = AquariumStock.objects.get(id=self.fk_aquarium_stock)

    def set_order_item(self, fk_order_item):
        self.order_item = OrderItem.objects.get(id=fk_order_item)

    def validate_quantity(self, value):
        if (value <= 0):
            raise serializers.ValidationError('출고 수량을 확인해주세요.')

        return value

    def validate(self, data):
        self.get_aquarium()
        self.get_aquarium_stock()

        if (data['description'] == 'goods_sales'):
            if ('order_item' not in data):
                raise serializers.ValidationError('처리할 주문을 선택해주세요.')

            self.set_order_item(data['order_item'])

            if (self.order_item.remaining_order_quantity - data['quantity'] < 0):
                raise serializers.ValidationError('주문 처리 수량을 초과합니다.')
        else:
            data['order_item'] = None

        if (self.aquarium_stock.quantity - data['quantity'] < 0):
            raise serializers.ValidationError('재고 수량이 부족합니다.')

        return data

    def create(self, validated_data):
        ledger_value = AquariumStock.objects.select_related('aquarium', 'creature').annotate(
            storage_room_name=F('aquarium__aquarium_section__storage_room__storage_room_name'),
            section_name=F('aquarium__aquarium_section__section_name'),
            aquarium_row=F('aquarium__row'),
            aquarium_column=F('aquarium__column'),
            species=F('creature__species'),
            breed=F('creature__breed'),
            remark=F('creature__remark'),
        ).get(id=self.fk_aquarium_stock)

        stock_ledger = StockLedger.objects.create(
            console=Console.objects.get(id=self.fk_console),
            aquarium=self.aquarium,
            storage_room_name=ledger_value.storage_room_name,
            section_name=ledger_value.section_name,
            aquarium_row=ledger_value.aquarium_row,
            aquarium_column=ledger_value.aquarium_column,
            species=ledger_value.species,
            breed=ledger_value.breed,
            remark=ledger_value.remark,
            size=self.aquarium_stock.size,
            transaction_type=validated_data['transaction_type'],
            description=validated_data['description'],
            quantity=validated_data['quantity'],
        )

        if (self.aquarium_stock.quantity - validated_data['quantity'] == 0):
            creature_dependency = AquariumStock.objects.values_list('console', 'creature').filter(
                console=self.fk_console,
                creature=self.aquarium_stock.creature,
            ).union(
                UnitPrice.objects.values_list('console', 'creature').filter(
                    console=self.fk_console,
                    creature=self.aquarium_stock.creature,
                ),
                all=True,
            ).count()

            if (creature_dependency == 1):
                Creature.objects.filter(
                    id=Subquery(
                        AquariumStock.objects.filter(
                            id=self.fk_aquarium_stock
                        ).values_list('creature')[:1]
                    )
                ).delete()

            self.aquarium_stock.delete()

            is_empty = AquariumStock.objects.filter(console=self.fk_console, aquarium=self.fk_aquarium).count()

            if (is_empty == 0):
                self.aquarium.is_empty = True
                self.aquarium.save()
        else:
            self.aquarium_stock.quantity = F('quantity') - validated_data['quantity']
            self.aquarium_stock.save()

        if validated_data['order_item'] is not None:
            stock_ledger.order_item = self.order_item

            UnitPrice.objects.filter(
                id=Subquery(
                    OrderItem.objects.filter(
                        id=validated_data['order_item']
                    ).values_list('unit_price')[:1]
                )
            ).update(
                order_quantity=F('order_quantity') - validated_data['quantity']
            )
            
            if (self.order_item.remaining_order_quantity - validated_data['quantity'] == 0):
                self.order_item.unit_price = None

            self.order_item.remaining_order_quantity = F('remaining_order_quantity') - validated_data['quantity']
            self.order_item.save()

            Order.objects.filter(
                id=Subquery(
                    OrderItem.objects.filter(
                        id=validated_data['order_item']
                    ).values_list('order')[:1]
                )
            ).update(
                task_status=Subquery(
                    OrderItem.objects.values('order').annotate(
                        sum_quantity=Sum('quantity'),
                        sum_remaining_order_quantity=Sum('remaining_order_quantity'),
                        task_status=Case(
                            When(
                                Q(sum_remaining_order_quantity__gt=0) & Q(sum_remaining_order_quantity__lt=F('sum_quantity')),
                                then=Value('in_progress'),
                            ),
                            When(
                                sum_remaining_order_quantity=0,
                                then=Value('completed'),
                            ),
                            output_field=CharField(),
                        )
                    ).filter(
                        order=Subquery(
                            OrderItem.objects.filter(
                                id=validated_data['order_item']
                            ).values_list('order')[:1]
                        )
                    ).values_list('task_status')[:1]
                )
            )
            
        stock_ledger.save()

        return stock_ledger


class GoodsReceiptSerializer(serializers.Serializer):
    transaction_type = serializers.ChoiceField(required=True, choices=TRANSACTION_TYPE_CHOICES)
    description = serializers.ChoiceField(required=True, choices=DESCRIPTION_CHOICES)
    quantity = serializers.IntegerField(
        required=True,
        error_messages={
            'blank': '출고 수량을 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )
    purchase_price = serializers.IntegerField(
        required=False,
        error_messages={
            'blank': '출고 수량을 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )

    def set_foreign_key(self, fk_console, fk_aquarium, fk_aquarium_stock):
        self.fk_console = fk_console
        self.fk_aquarium = fk_aquarium
        self.fk_aquarium_stock = fk_aquarium_stock

    def get_aquarium(self):
        self.aquarium = Aquarium.objects.get(id=self.fk_aquarium)

    def get_aquarium_stock(self):
        self.aquarium_stock = AquariumStock.objects.get(id=self.fk_aquarium_stock)

    def validate_quantity(self, value):
        if (value <= 0):
            raise serializers.ValidationError('입고 수량을 확인해주세요.')

        return value

    def validate(self, data):
        self.get_aquarium()
        self.get_aquarium_stock()

        if (data['description'] == 'purchase_of_goods'):
            if (data['purchase_price'] <= 0):
                raise serializers.ValidationError('가격을 확인해주세요.')

        return data

    def create(self, validated_data):
        ledger_value = AquariumStock.objects.select_related('aquarium', 'creature').annotate(
            storage_room_name=F('aquarium__aquarium_section__storage_room__storage_room_name'),
            section_name=F('aquarium__aquarium_section__section_name'),
            aquarium_row=F('aquarium__row'),
            aquarium_column=F('aquarium__column'),
            species=F('creature__species'),
            breed=F('creature__breed'),
            remark=F('creature__remark'),
        ).get(id=self.fk_aquarium_stock)

        stock_ledger = StockLedger.objects.create(
            console=Console.objects.get(id=self.fk_console),
            aquarium=self.aquarium,
            storage_room_name=ledger_value.storage_room_name,
            section_name=ledger_value.section_name,
            aquarium_row=ledger_value.aquarium_row,
            aquarium_column=ledger_value.aquarium_column,
            species=ledger_value.species,
            breed=ledger_value.breed,
            remark=ledger_value.remark,
            size=self.aquarium_stock.size,
            transaction_type=validated_data['transaction_type'],
            description=validated_data['description'],
            quantity=validated_data['quantity'],
        )

        if ('purchase_price' in validated_data):
            stock_ledger.purchase_price = validated_data['purchase_price']
            stock_ledger.save()

        self.aquarium_stock.quantity = F('quantity') + validated_data['quantity']
        self.aquarium_stock.save()

        return stock_ledger
