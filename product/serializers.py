from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from rest_framework import serializers
from console.models import Console
from product.models import STAGES_OF_DEVELOPMENT_CHOICES, UNIT_CHOICES, SCOPE_OF_SALES_CHOICES, Creature, UnitPrice
from inventory.models import AquariumStock

# Create your serializers here.


class CreatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Creature
        fields = ('species', 'breed', 'remark',)


class UnitPriceSerializer(serializers.Serializer):
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
    min_size = serializers.FloatField(
        required=True,
        error_messages={
            'blank': '최소 크기를 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )
    max_size = serializers.FloatField(
        required=True,
        error_messages={
            'blank': '최대 크기를 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )
    stages_of_development = serializers.ChoiceField(
        required=True,
        choices=STAGES_OF_DEVELOPMENT_CHOICES,
    )
    unit = serializers.ChoiceField(
        required=True,
        choices=UNIT_CHOICES,
    )
    scope_of_sales = serializers.ChoiceField(
        required=True,
        choices=SCOPE_OF_SALES_CHOICES,
    )
    price = serializers.FloatField(
        required=True,
        error_messages={
            'blank': '가격을 입력해주세요.',
            'invalid': '유효한 숫자가 필요합니다.',
        },
    )

    def set_foreign_key(self, fk_console):
        self.fk_console = fk_console

    def get_creature(self, species, breed, remark):
        try:
            creature = Creature.objects.get(species=species, breed=breed, remark=remark, console=self.fk_console)
        except ObjectDoesNotExist:
            creature = None

        return creature

    def validate(self, data):
        creature = self.get_creature(data['species'], data['breed'], data['remark'])

        if creature is not None:
            unit_price = UnitPrice.objects.filter(
                Q(min_size__lte=data['min_size']) & Q(max_size__gte=data['min_size']) |
                Q(min_size__lte=data['max_size']) & Q(max_size__gte=data['max_size']),
                console=Console.objects.get(id=self.fk_console),
                creature=creature,
                unit=data['unit'],
            )

            if unit_price.exists():
                raise serializers.ValidationError('해당 범위에 등록된 단가가 존재합니다.')

        if data['min_size'] > data['max_size']:
            raise serializers.ValidationError('크기의 범위를 확인하세요.')

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

        unit_price = UnitPrice.objects.create(
            console=Console.objects.get(id=self.fk_console),
            creature=creature,
            min_size=validated_data['min_size'],
            max_size=validated_data['max_size'],
            stages_of_development=validated_data['stages_of_development'],
            scope_of_sales=validated_data['scope_of_sales'],
            unit=validated_data['unit'],
            price=validated_data['price'],
        )

        aquarium_stock = AquariumStock.objects.filter(
            Q(size__gte=validated_data['min_size']) & Q(size__lte=validated_data['max_size']),
            console=Console.objects.get(id=self.fk_console),
            creature=creature,
            gender=validated_data['unit'],
        )

        aquarium_stock.update(unit_price=unit_price)

        return unit_price
