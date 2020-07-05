from django.db import models
import business.models as BusinessModels

# Create your models here.


class StorageRoom(models.Model):
    business = models.ForeignKey(
        BusinessModels.Business,
        on_delete=models.CASCADE
    )
    storage_room_name = models.CharField(max_length=20)
    modified_date = models.DateTimeField()

    objects = models.Manager()  # for Visual Studio Code

    def __str__(self):
        return self.storage_room_name


class AquariumSection(models.Model):
    storage_room = models.ForeignKey(
        StorageRoom,
        on_delete=models.CASCADE
    )
    section_name = models.CharField(max_length=20)
    section_color = models.CharField(max_length=20)
    aquarium_num_of_rows = models.IntegerField(default=0)
    aquarium_num_of_columns = models.IntegerField(default=0)
    modified_date = models.DateTimeField()

    objects = models.Manager()  # for Visual Studio Code

    def __str__(self):
        return self.section_name


class StoreLayout(models.Model):
    storage_room = models.ForeignKey(
        StorageRoom,
        on_delete=models.CASCADE
    )
    aquarium_section = models.ForeignKey(
        AquariumSection,
        on_delete=models.CASCADE
    )
    row = models.IntegerField(default=0)
    column = models.IntegerField(default=0)

    objects = models.Manager()  # for Visual Studio Code

    def __str__(self):
        return str(self.pk)


class Aquarium(models.Model):
    aquarium_section = models.ForeignKey(
        AquariumSection,
        on_delete=models.CASCADE
    )
    row = models.IntegerField(default=0)
    column = models.IntegerField(default=0)
    alias = models.CharField(max_length=20, null=True)
    state = models.CharField(max_length=20, null=True)
    memo = models.TextField(null=True)
    ph = models.FloatField(default=7.0, null=True)
    config_date = models.DateTimeField()
    modified_date = models.DateTimeField()

    objects = models.Manager()  # for Visual Studio Code

    def __str__(self):
        return str(self.pk)
