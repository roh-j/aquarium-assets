from django.db import models
from django.utils import timezone
from store.models import Aquarium
from console.models import Console
from product.models import Creature, UnitPrice
from order.models import OrderItem

# Create your models here.

GENDER_CHOICES = (
    ('none', 'none'),
    ('female', 'female'),
    ('male', 'male'),
)
CONTROL_CHOICES = (
    ('with_shipping_closing', 'with_shipping_closing'),
    ('without_shipping_closing', 'without_shipping_closing'),
    ('with_receiving_closing', 'with_receiving_closing'),
    ('without_receiving_closing', 'without_receiving_closing'),
)
WITHOUT_SHIPPING_CLOSING_TYPE_CHOICES = (
    ('parcel_out', 'parcel_out'),
    ('death', 'death'),
)


class AquariumStock(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    aquarium = models.ForeignKey(
        Aquarium,
        on_delete=models.CASCADE,
    )
    creature = models.ForeignKey(
        Creature,
        on_delete=models.CASCADE,
    )
    unit_price = models.ForeignKey(
        UnitPrice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        default='none',
    )
    size = models.FloatField(default=0.0)
    quantity = models.IntegerField(default=1)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code


class StockRecord(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    aquarium = models.ForeignKey(
        Aquarium,
        on_delete=models.CASCADE,
    )
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    control = models.CharField(
        max_length=30,
        choices=CONTROL_CHOICES,
        default='with_shipping_closing',
    )
    quantity = models.IntegerField(default=1)
    with_receiving_closing_price = models.IntegerField(null=True, blank=True)
    without_shipping_closing_type = models.CharField(
        max_length=20,
        choices=WITHOUT_SHIPPING_CLOSING_TYPE_CHOICES,
        null=True,
        blank=True,
    )
