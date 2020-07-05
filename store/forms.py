from django import forms
from django.contrib.auth.models import User
from django.conf import settings
from main.models import Business
from .models import StorageRoom, AquariumSection, StoreLayout
import datetime

# Create your forms here.


class StorageRoomForm(forms.ModelForm):
    storage_room_name = forms.CharField(required=True)

    class Meta:
        model = StorageRoom
        fields = ('storage_room_name',)

    def set_FK(self, key):
        self.FK = key

    def save(self, commit=True):
        storage_room = super(StorageRoomForm, self).save(commit=False)

        storage_room.business = Business.objects.get(id=self.FK)
        storage_room.storage_room_name = self.cleaned_data['storage_room_name']
        storage_room.modified_date = datetime.datetime.now()

        if commit:
            storage_room.save()
        return storage_room


class AquariumSectionForm(forms.ModelForm):
    section_name = forms.CharField(required=True)
    section_color = forms.CharField(required=True)
    aquarium_num_of_rows = forms.CharField(required=True)
    aquarium_num_of_columns = forms.CharField(required=True)

    class Meta:
        model = AquariumSection
        fields = ('section_name', 'section_color',
                  'aquarium_num_of_rows', 'aquarium_num_of_columns',)

    def set_FK(self, key):
        self.FK = key

    def save(self, commit=True):
        aquarium_section = super(AquariumSectionForm, self).save(commit=False)

        aquarium_section.storage_room = StorageRoom.objects.get(id=self.FK)
        aquarium_section.section_name = self.cleaned_data['section_name']
        aquarium_section.section_color = self.cleaned_data['section_color']
        aquarium_section.aquarium_num_of_rows = self.cleaned_data['aquarium_num_of_rows']
        aquarium_section.aquarium_num_of_columns = self.cleaned_data['aquarium_num_of_columns']
        aquarium_section.modified_date = datetime.datetime.now()

        if commit:
            aquarium_section.save()
        return aquarium_section


class StoreLayoutForm(forms.ModelForm):
    row = forms.IntegerField(required=True)
    column = forms.IntegerField(required=True)

    class Meta:
        model = StoreLayout
        fields = ('row', 'column',)

    def set_FK(self, key1, key2):
        self.FK1 = key1
        self.FK2 = key2

    def save(self, commit=True):
        store_layout = super(StoreLayoutForm, self).save(commit=False)

        store_layout.storage_room = StorageRoom.objects.get(id=self.FK1)
        store_layout.aquarium_section = AquariumSection.objects.get(
            id=self.FK2)
        store_layout.row = self.cleaned_data['row']
        store_layout.column = self.cleaned_data['column']

        if commit:
            store_layout.save()
        return store_layout
