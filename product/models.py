from django.db import models
from django.utils import timezone
from console.models import Console

# Create your models here.

DEVELOPMENT_CHOICES = (
    ('adult', 'adult'),
    ('immature', 'immature'),
    ('juvenile', 'juvenile'),
    ('larva', 'larva'),
)
UNIT_CHOICES = (
    ('none', 'none'),
    ('female', 'female'),
    ('male', 'male'),
)


class Creature(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code


class UnitPrice(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    creature = models.ForeignKey(
        Creature,
        on_delete=models.CASCADE,
    )
    min_size = models.FloatField(default=0.0)
    max_size = models.FloatField(default=0.0)
    stages_of_development = models.CharField(
        max_length=20,
        choices=DEVELOPMENT_CHOICES,
        default='adult'
    )
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default='none'
    )
    price = models.IntegerField(default=0)
    order_quantity = models.IntegerField(default=0)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code
