from django.utils import timezone
from rest_framework import serializers
from console.models import Console
from store.models import StorageRoom, AquariumSection, StoreLayout, Aquarium

# Create your serializers here.


class StorageRoomSerializer(serializers.ModelSerializer):
    storage_room_name = serializers.CharField(required=True)

    class Meta:
        model = StorageRoom
        fields = ('storage_room_name', 'last_modified_date',)

    def set_foreign_key(self, fk_console):
        self.fk_console = fk_console

    def create(self, validated_data):
        storage_room = StorageRoom.objects.create(
            console=Console.objects.get(id=self.fk_console),
            storage_room_name=validated_data['storage_room_name'],
            last_modified_date=timezone.now(),
        )

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

    def set_foreign_key(self, fk_storage_room):
        self.fk_storage_room = fk_storage_room

    def create(self, validated_data):
        aquarium_section = AquariumSection.objects.create(
            storage_room=StorageRoom.objects.get(id=self.fk_storage_room),
            section_name=validated_data['section_name'],
            section_color=validated_data['section_color'],
            aquarium_num_of_rows=validated_data['aquarium_num_of_rows'],
            aquarium_num_of_columns=validated_data['aquarium_num_of_columns'],
        )

        aquarium_section.last_modified_date = timezone.now()

        for row in range(validated_data['aquarium_num_of_rows']):
            for column in range(validated_data['aquarium_num_of_columns']):
                Aquarium.objects.create(
                    aquarium_section=aquarium_section,
                    row=row,
                    column=column,
                )

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
        fields = ('id', 'row', 'column', 'alias', 'memo',
                  'setup_date', 'last_modified_date', 'creation_date',)


class StoreLayoutSerializer(serializers.ModelSerializer):
    row = serializers.IntegerField(required=True)
    column = serializers.IntegerField(required=True)

    class Meta:
        model = StoreLayout
        fields = ('row', 'column',)

    def set_foreign_key(self, fk_storage_room, fk_aquarium_section):
        self.fk_storage_room = fk_storage_room
        self.fk_aquarium_section = fk_aquarium_section

    def create(self, validated_data):
        store_layout = StoreLayout.objects.create(
            storage_room=StorageRoom.objects.get(id=self.fk_storage_room),
            aquarium_section=AquariumSection.objects.get(id=self.fk_aquarium_section),
            row=validated_data['row'],
            column=validated_data['column'],
        )

        return store_layout
