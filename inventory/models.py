from django.db import models
from django.utils import timezone
from console.models import Console
from store.models import Aquarium
from product.models import Creature, UnitPrice
from order.models import OrderItem

# Create your models here.

GENDER_CHOICES = (
    ('none', 'none'),
    ('female', 'female'),
    ('male', 'male'),
)
TRANSACTION_TYPE_CHOICES = (
    ('goods_issue', 'goods_issue'),
    ('goods_receipt', 'goods_receipt'),
)
DESCRIPTION_CHOICES = (
    ('goods_sales', 'goods_sales'),
    ('parcel_out', 'parcel_out'),
    ('death', 'death'),
    ('purchase_of_goods', 'purchase_of_goods'),
    ('adoption', 'adoption'),
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


class StockLedger(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    aquarium = models.ForeignKey(
        Aquarium,
        on_delete=models.CASCADE,
    )
    aquarium_stock = models.ForeignKey(
        AquariumStock,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    order_item = models.ForeignKey(
        OrderItem,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    transaction_type = models.CharField(
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES,
        default='goods_issue',
    )
    description = models.CharField(
        max_length=30,
        choices=DESCRIPTION_CHOICES,
        default='goods_sales',
    )
    quantity = models.IntegerField(default=1)
    purchase_price = models.IntegerField(null=True, blank=True)

    objects = models.Manager()  # for Visual Studio Code
