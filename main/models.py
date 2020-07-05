from django.db import models
from django.conf import settings

# Create your models here.


class UserLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    access_time = models.DateTimeField()
    ip_address = models.CharField(max_length=60)

    objects = models.Manager()  # for Visual Studio Code


class Ticket(models.Model):
    ticket_name = models.CharField(max_length=200)
    price = models.IntegerField(default=0)

    objects = models.Manager()  # for Visual Studio Code


class PurchaseTicket(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.SET_NULL,
        null=True
    )
    purchase_date = models.DateTimeField()
    service_period = models.IntegerField(default=1)

    objects = models.Manager()  # for Visual Studio Code


class Profile(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    objects = models.Manager()  # for Visual Studio Code
