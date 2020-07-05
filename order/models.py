from django.db import models
from django.utils import timezone
from console.models import Console

# Create your models here.

SHIPPING_CHOICES = (
    ('in_store', 'in_store'),
    ('delivery', 'delivery'),
)
ORDER_CHOICES = (
    ('activate', 'activate'),
    ('inactivate', 'inactivate'),
)
TASK_CHOICES = (
    ('not_started', 'not_started'),
    ('in_progress', 'in_progress'),
    ('completed', 'completed'),
)
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


class Order(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    shipping_type = models.CharField(
        max_length=20,
        choices=SHIPPING_CHOICES,
        default='in_store',
    )
    tracking_number = models.CharField(max_length=30, null=True, blank=True)
    order_status = models.CharField(
        max_length=20,
        choices=ORDER_CHOICES,
        default='activate',
    )
    task_status = models.CharField(
        max_length=20,
        choices=TASK_CHOICES,
        default='not_started',
    )
    order_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
    )
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
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
    quantity = models.IntegerField(default=1)
    remaining_order_quantity = models.IntegerField(default=1)

    objects = models.Manager()  # for Visual Studio Code
