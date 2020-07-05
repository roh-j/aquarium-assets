from django.db import models
from django.utils import timezone
from console.models import Console
from product.models import UnitPrice
from customer.models import Customer

# Create your models here.

ORDER_TYPE_CHOICES = (
    ('pickup', 'pickup'),
    ('delivery', 'delivery'),
)
ORDER_STATUS_CHOICES = (
    ('active', 'active'),
    ('canceled', 'canceled'),
)
TASK_STATUS_CHOICES = (
    ('not_started', 'not_started'),
    ('in_progress', 'in_progress'),
    ('completed', 'completed'),
)
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


class Order(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    customer_name = models.CharField(max_length=40)
    contact = models.CharField(max_length=20)
    address = models.CharField(max_length=200)
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE_CHOICES,
        default='pickup',
    )
    tracking_number = models.CharField(max_length=30, null=True, blank=True)
    order_status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='active',
    )
    task_status = models.CharField(
        max_length=20,
        choices=TASK_STATUS_CHOICES,
        default='not_started',
    )
    order_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name='order_items',
        on_delete=models.CASCADE,
    )
    unit_price = models.ForeignKey(
        UnitPrice,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    species = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    remark = models.CharField(max_length=200, null=True, blank=True)
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
    price = models.IntegerField(default=0)
    quantity = models.IntegerField(default=1)
    remaining_order_quantity = models.IntegerField(default=1)

    objects = models.Manager()  # for Visual Studio Code
