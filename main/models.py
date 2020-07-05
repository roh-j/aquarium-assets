from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.

MEMBERSHIP_CHOICES = (
    ('general', 'general'),
    ('business', 'business'),
)
SALES_CHOICES = (
    ('active', 'active'),
    ('inactive', 'inactive'),
)


class Ticket(models.Model):
    ticket_name = models.CharField(max_length=200)
    price = models.IntegerField(default=0)
    sales_status = models.CharField(
        max_length=20,
        choices=SALES_CHOICES,
        default='active',
    )

    objects = models.Manager()  # for Visual Studio Code


class PurchaseTicket(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
    )
    purchase_date = models.DateTimeField(default=timezone.now)
    service_period = models.IntegerField(default=1)

    objects = models.Manager()  # for Visual Studio Code


class Profile(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    membership = models.CharField(
        max_length=20,
        choices=MEMBERSHIP_CHOICES,
        default='general',
    )

    objects = models.Manager()  # for Visual Studio Code
