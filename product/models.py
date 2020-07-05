from django.db import models
from django.utils import timezone
from console.models import Console

# Create your models here.

STAGES_OF_DEVELOPMENT_CHOICES = (
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
SCOPE_OF_SALES_CHOICES = (
    ('store_and_online', 'store_and_online'),
    ('store_only', 'store_only'),
    ('online_only', 'online_only'),
    ('not_for_sale', 'not_for_sale'),
)


class Creature(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    remark = models.CharField(max_length=200, null=True, blank=True)
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
        choices=STAGES_OF_DEVELOPMENT_CHOICES,
        default='adult',
    )
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default='none',
    )
    scope_of_sales = models.CharField(
        max_length=20,
        choices=SCOPE_OF_SALES_CHOICES,
        default='not_for_sale',
    )
    price = models.IntegerField(default=0)
    order_quantity = models.IntegerField(default=0)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code
