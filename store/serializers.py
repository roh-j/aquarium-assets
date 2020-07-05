from rest_framework import serializers
from django.core import exceptions
from business.models import Business
from .models import StorageRoom, AquariumSection, StoreLayout, Aquarium
import datetime

# Create your serializers here.


class StorageRoomSerializer(serializers.ModelSerializer):
    storage_room_name = serializers.CharField(required=True)

    class Meta:
        model = StorageRoom
        fields = ('storage_room_name',)

    def set_FK(self, key):
        self.FK = key

    def create(self, validated_data):
        storage_room = StorageRoom.objects.create(
            business=Business.objects.get(pk=self.FK),
            storage_room_name=validated_data['storage_room_name'],
            modified_date=datetime.datetime.now(),
        )

        storage_room.save()
        return storage_room


class AquariumSectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = AquariumSection
        fields = ('pk', 'section_name', 'section_color',
                  'aquarium_num_of_rows', 'aquarium_num_of_columns',)

    def set_FK(self, key):
        self.FK = key

    def create(self, validated_data):
        aquarium_section = AquariumSection.objects.create(
            storage_room=StorageRoom.objects.get(pk=self.FK),
            section_name=validated_data['section_name'],
            section_color=validated_data['section_color'],
            aquarium_num_of_rows=validated_data['aquarium_num_of_rows'],
            aquarium_num_of_columns=validated_data['aquarium_num_of_columns'],
            modified_date=datetime.datetime.now(),
        )

        aquarium_section.save()

        for i in range(validated_data['aquarium_num_of_rows']):
            for j in range(validated_data['aquarium_num_of_columns']):
                aquarium = Aquarium.objects.create(
                    aquarium_section=aquarium_section,
                    row=i,
                    column=j,
                    config_date=datetime.datetime.now(),
                    modified_date=datetime.datetime.now(),
                )
                aquarium.save()
        return aquarium_section


class AquariumSerializer(serializers.ModelSerializer):

    class Meta:
        model = Aquarium
        fields = ('pk', 'row', 'column', 'alias', 'state', 'memo', 'ph', )


class StoreLayoutSerializer(serializers.ModelSerializer):
    row = serializers.IntegerField(required=True)
    column = serializers.IntegerField(required=True)

    class Meta:
        model = StoreLayout
        fields = ('row', 'column',)

    def set_FK(self, key1, key2):
        self.FK1 = key1  # StorageRoom
        self.FK2 = key2  # AquariumSection

    def create(self, validated_data):
        store_layout = StoreLayout.objects.create(
            storage_room=StorageRoom.objects.get(pk=self.FK1),
            aquarium_section=AquariumSection.objects.get(pk=self.FK2),
            row=validated_data['row'],
            column=validated_data['column'],
        )

        store_layout.save()
        return store_layout
