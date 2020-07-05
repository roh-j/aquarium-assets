from rest_framework import serializers
from django.utils import timezone
from console.models import Console
from store.models import StorageRoom, AquariumSection, StoreLayout, Aquarium

# Create your serializers here.


class StorageRoomSerializer(serializers.ModelSerializer):
    storage_room_name = serializers.CharField(required=True)

    class Meta:
        model = StorageRoom
        fields = ('storage_room_name', 'last_modified_date',)

    def set_foreign_key(self, key):
        self.FK = key

    def create(self, validated_data):
        storage_room = StorageRoom.objects.create(
            console=Console.objects.get(id=self.FK),
            storage_room_name=validated_data['storage_room_name'],
            last_modified_date=timezone.now(),
        )

        storage_room.save()
        return storage_room


class AquariumSectionSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(required=True)
    section_color = serializers.CharField(required=True)
    aquarium_num_of_rows = serializers.IntegerField(required=True)
    aquarium_num_of_columns = serializers.IntegerField(required=True)

    class Meta:
        model = AquariumSection
        fields = ('id', 'section_name', 'section_color',
                  'aquarium_num_of_rows', 'aquarium_num_of_columns',)

    def set_foreign_key(self, key):
        self.FK = key

    def create(self, validated_data):
        aquarium_section = AquariumSection.objects.create(
            storage_room=StorageRoom.objects.get(id=self.FK),
            section_name=validated_data['section_name'],
            section_color=validated_data['section_color'],
            aquarium_num_of_rows=validated_data['aquarium_num_of_rows'],
            aquarium_num_of_columns=validated_data['aquarium_num_of_columns'],
        )

        aquarium_section.last_modified_date = timezone.now()

        aquarium_section.save()

        for row in range(validated_data['aquarium_num_of_rows']):
            for column in range(validated_data['aquarium_num_of_columns']):
                aquarium = Aquarium.objects.create(
                    aquarium_section=aquarium_section,
                    row=row,
                    column=column,
                )
                aquarium.save()

        return aquarium_section

    def update(self, instance, validated_data):
        instance.section_name = validated_data.get('section_name', instance.section_name)
        instance.section_color = validated_data.get('section_color', instance.section_color)
        instance.last_modified_date = timezone.now()

        instance.save()

        return instance


class AquariumSerializer(serializers.ModelSerializer):

    class Meta:
        model = Aquarium
        fields = ('id', 'row', 'column', 'alias', 'memo', 'setup_date', 'last_modified_date', 'creation_date',)


class StoreLayoutSerializer(serializers.ModelSerializer):
    row = serializers.IntegerField(required=True)
    column = serializers.IntegerField(required=True)

    class Meta:
        model = StoreLayout
        fields = ('row', 'column',)

    def set_foreign_key(self, key1, key2):
        self.FK1 = key1  # StorageRoom
        self.FK2 = key2  # AquariumSection

    def create(self, validated_data):
        store_layout = StoreLayout.objects.create(
            storage_room=StorageRoom.objects.get(id=self.FK1),
            aquarium_section=AquariumSection.objects.get(id=self.FK2),
            row=validated_data['row'],
            column=validated_data['column'],
        )

        store_layout.save()
        return store_layout
