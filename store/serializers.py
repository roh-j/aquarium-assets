from rest_framework import serializers
import business.models as BusinessModels
import store.models as StoreModels
import datetime

# Create your serializers here.


class StorageRoomSerializer(serializers.ModelSerializer):
    storage_room_name = serializers.CharField(required=True)

    class Meta:
        model = StoreModels.StorageRoom
        fields = ('storage_room_name',)

    def set_FK(self, key):
        self.FK = key

    def create(self, validated_data):
        storage_room = StoreModels.StorageRoom.objects.create(
            business=BusinessModels.Business.objects.get(pk=self.FK),
            storage_room_name=validated_data['storage_room_name'],
            modified_date=datetime.datetime.now(),
        )

        storage_room.save()
        return storage_room


class AquariumSectionSerializer(serializers.ModelSerializer):

    class Meta:
        model = StoreModels.AquariumSection
        fields = ('pk', 'section_name', 'section_color',
                  'aquarium_num_of_rows', 'aquarium_num_of_columns',)

    def set_FK(self, key):
        self.FK = key

    def create(self, validated_data):
        aquarium_section = StoreModels.AquariumSection.objects.create(
            storage_room=StoreModels.StorageRoom.objects.get(pk=self.FK),
            section_name=validated_data['section_name'],
            section_color=validated_data['section_color'],
            aquarium_num_of_rows=validated_data['aquarium_num_of_rows'],
            aquarium_num_of_columns=validated_data['aquarium_num_of_columns'],
            modified_date=datetime.datetime.now(),
        )

        aquarium_section.save()

        for i in range(validated_data['aquarium_num_of_rows']):
            for j in range(validated_data['aquarium_num_of_columns']):
                aquarium = StoreModels.Aquarium.objects.create(
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
        model = StoreModels.Aquarium
        fields = ('pk', 'row', 'column', 'alias', 'state', 'memo', 'ph', )


class StoreLayoutSerializer(serializers.ModelSerializer):
    row = serializers.IntegerField(required=True)
    column = serializers.IntegerField(required=True)

    class Meta:
        model = StoreModels.StoreLayout
        fields = ('row', 'column',)

    def set_FK(self, key1, key2):
        self.FK1 = key1  # StorageRoom
        self.FK2 = key2  # AquariumSection

    def create(self, validated_data):
        store_layout = StoreModels.StoreLayout.objects.create(
            storage_room=StoreModels.StorageRoom.objects.get(pk=self.FK1),
            aquarium_section=StoreModels.AquariumSection.objects.get(
                pk=self.FK2),
            row=validated_data['row'],
            column=validated_data['column'],
        )

        store_layout.save()
        return store_layout
