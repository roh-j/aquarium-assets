from django.db import models
from django.conf import settings
from django.utils import timezone
from console.models import Console

# Create your models here.

OPERATION_CHOICES = (
    ('active', 'active'),
    ('inactive', 'inactive'),
)


class StorageRoom(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    storage_room_name = models.CharField(max_length=100)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code


class AquariumSection(models.Model):
    storage_room = models.ForeignKey(
        StorageRoom,
        on_delete=models.CASCADE,
    )
    section_name = models.CharField(max_length=100)
    section_color = models.CharField(max_length=20)
    aquarium_num_of_rows = models.IntegerField(default=0)
    aquarium_num_of_columns = models.IntegerField(default=0)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code


class StoreLayout(models.Model):
    storage_room = models.ForeignKey(
        StorageRoom,
        on_delete=models.CASCADE,
    )
    aquarium_section = models.ForeignKey(
        AquariumSection,
        on_delete=models.CASCADE,
    )
    row = models.IntegerField(default=0)
    column = models.IntegerField(default=0)

    objects = models.Manager()  # for Visual Studio Code


class Aquarium(models.Model):
    aquarium_section = models.ForeignKey(
        AquariumSection,
        on_delete=models.CASCADE,
    )
    row = models.IntegerField(default=0)
    column = models.IntegerField(default=0)
    alias = models.CharField(max_length=20, null=True, blank=True)
    operation_status = models.CharField(
        max_length=20,
        choices=OPERATION_CHOICES,
        default='active',
    )
    memo = models.TextField(null=True, blank=True)
    setup_date = models.DateTimeField(default=timezone.now)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code
