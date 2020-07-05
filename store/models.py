from django.db import models
from main.models import Business

# Create your models here.


class StorageRoom(models.Model):
    id = models.AutoField(primary_key=True)
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE
    )
    storage_room_name = models.CharField(max_length=20)
    modified_date = models.DateTimeField()

    objects = models.Manager()  # VS Code 버그 해결을 위한 코드

    def __str__(self):
        return str(self.id)


class AquariumSection(models.Model):
    id = models.AutoField(primary_key=True)
    storage_room = models.ForeignKey(
        StorageRoom,
        on_delete=models.CASCADE
    )
    section_name = models.CharField(max_length=20)
    section_color = models.CharField(max_length=20)
    aquarium_num_of_rows = models.IntegerField(default=0)
    aquarium_num_of_columns = models.IntegerField(default=0)
    modified_date = models.DateTimeField()

    objects = models.Manager()  # VS Code 버그 해결을 위한 코드

    def __str__(self):
        return str(self.id)


class StoreLayout(models.Model):
    id = models.AutoField(primary_key=True)
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

    objects = models.Manager()  # VS Code 버그 해결을 위한 코드

    def __str__(self):
        return str(self.id)