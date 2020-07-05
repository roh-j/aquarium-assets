from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers
from console.models import Console
from store.models import Aquarium
from product.models import Creature, UnitPrice
from inventory.models import AquariumStock, GENDER_CHOICES

# Create your serializers here.


class AquariumStockSerializer(serializers.Serializer):
    species = serializers.CharField(write_only=True, required=True)
    breed = serializers.CharField(write_only=True, required=True)
    gender = serializers.ChoiceField(required=True, choices=GENDER_CHOICES)
    size = serializers.FloatField(required=True)
    quantity = serializers.IntegerField(required=True)
    remark = serializers.CharField(allow_blank=True, required=False)

    def set_FK(self, key1, key2):
        self.FK1 = key1  # Console
        self.FK2 = key2  # Aquarium

    def get_creature(self, species, breed):
        try:
            creature = Creature.objects.get(species=species, breed=breed, console=self.FK1)
        except ObjectDoesNotExist:
            creature = None

        return creature

    def validate(self, data):
        creature = self.get_creature(data['species'], data['breed'])

        if creature is not None:
            aquarium_stock = AquariumStock.objects.filter(
                console=Console.objects.get(id=self.FK1),
                aquarium=Aquarium.objects.get(id=self.FK2),
                creature=creature,
                gender=data['gender'],
                size=data['size'],
                remark=data['remark'],
            )

            if aquarium_stock.exists():
                raise serializers.ValidationError()

        return data

    def create(self, validated_data):
        creature = self.get_creature(validated_data['species'], validated_data['breed'])

        if creature is None:
            creature = Creature.objects.create(
                console=Console.objects.get(id=self.FK1),
                species=validated_data['species'],
                breed=validated_data['breed'],
            )
            creature.save()

        aquarium_stock = AquariumStock.objects.create(
            console=Console.objects.get(id=self.FK1),
            aquarium=Aquarium.objects.get(id=self.FK2),
            creature=creature,
            gender=validated_data['gender'],
            size=validated_data['size'],
            quantity=validated_data['quantity'],
            remark=validated_data['remark'],
        )

        try:
            unit_price = UnitPrice.objects.get(
                Q(min_size__lte=validated_data['size']) & Q(max_size__gte=validated_data['size']),
                console=Console.objects.get(id=self.FK1),
                creature=creature,
                unit=validated_data['gender'],
            )
        except ObjectDoesNotExist:
            unit_price = None

        if unit_price is not None:
            aquarium_stock.unit_price = unit_price

        aquarium_stock.save()

        return aquarium_stock
