from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from rest_framework import serializers
from console.models import Console
from product.models import DEVELOPMENT_CHOICES, UNIT_CHOICES, Creature, UnitPrice
from inventory.models import AquariumStock

# Create your serializers here.


class CreatureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Creature
        fields = ('species', 'breed',)


class UnitPriceSerializer(serializers.Serializer):
    species = serializers.CharField(write_only=True, required=True)
    breed = serializers.CharField(write_only=True, required=True)
    min_size = serializers.FloatField(required=True)
    max_size = serializers.FloatField(required=True)
    stages_of_development = serializers.ChoiceField(required=True, choices=DEVELOPMENT_CHOICES)
    unit = serializers.ChoiceField(required=True, choices=UNIT_CHOICES)
    price = serializers.FloatField(required=True)

    def set_FK(self, key):
        self.FK = key

    def get_creature(self, species, breed):
        try:
            creature = Creature.objects.get(species=species, breed=breed, console=self.FK)
        except ObjectDoesNotExist:
            creature = None

        return creature

    def validate(self, data):
        creature = self.get_creature(data['species'], data['breed'])

        if creature is not None:
            unit_price = UnitPrice.objects.filter(
                Q(min_size__lte=data['min_size']) & Q(max_size__gte=data['min_size']) |
                Q(min_size__lte=data['max_size']) & Q(max_size__gte=data['max_size']),
                console=Console.objects.get(id=self.FK),
                creature=creature,
                unit=data['unit'],
            )

            if unit_price.exists():
                raise serializers.ValidationError()

        if data['min_size'] > data['max_size']:
            raise serializers.ValidationError()

        return data

    def create(self, validated_data):
        creature = self.get_creature(validated_data['species'], validated_data['breed'])

        if creature is None:
            creature = Creature.objects.create(
                console=Console.objects.get(id=self.FK),
                species=validated_data['species'],
                breed=validated_data['breed'],
            )
            creature.save()

        unit_price = UnitPrice.objects.create(
            console=Console.objects.get(id=self.FK),
            creature=creature,
            min_size=validated_data['min_size'],
            max_size=validated_data['max_size'],
            stages_of_development=validated_data['stages_of_development'],
            unit=validated_data['unit'],
            price=validated_data['price'],
        )

        aquarium_stock = AquariumStock.objects.filter(
            Q(size__gte=validated_data['min_size']) & Q(size__lte=validated_data['max_size']),
            console=Console.objects.get(id=self.FK),
            creature=creature,
            gender=validated_data['unit'],
        )

        aquarium_stock.update(unit_price=unit_price)
        unit_price.save()

        return unit_price
