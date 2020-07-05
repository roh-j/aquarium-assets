from rest_framework import serializers
import price.models as PriceModels
import business.models as BusinessModels
import datetime

# Create your serializers here.


class UnitPriceSerializer(serializers.ModelSerializer):
    species = serializers.CharField(required=True)
    breed = serializers.CharField(required=True)
    size = serializers.FloatField(required=True)
    unit = serializers.ChoiceField(
        required=True, choices=PriceModels.UNIT_CHOICES)
    price = serializers.FloatField(required=True)

    class Meta:
        model = PriceModels.UnitPrice
        fields = ('pk', 'species', 'breed', 'size', 'unit', 'price',)

    def set_FK(self, key):
        self.FK = key

    def create(self, validated_data):
        unit_price = PriceModels.UnitPrice.objects.create(
            business=BusinessModels.Business.objects.get(pk=self.FK),
            species=validated_data['species'],
            breed=validated_data['breed'],
            size=validated_data['size'],
            unit=validated_data['unit'],
            price=validated_data['price'],
            publication_date=datetime.datetime.now(),
        )

        unit_price.save()
        return unit_price


class SpeciesSerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(read_only=True)

    class Meta:
        model = PriceModels.UnitPrice
        fields = ('species', 'count',)


class BreedSerializer(serializers.ModelSerializer):
    count = serializers.IntegerField(read_only=True)

    class Meta:
        model = PriceModels.UnitPrice
        fields = ('breed', 'count',)
