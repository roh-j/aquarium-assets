from django.db import models
from django.utils import timezone
from console.models import Console

# Create your models here.


class Customer(models.Model):
    console = models.ForeignKey(
        Console,
        on_delete=models.CASCADE,
    )
    customer_name = models.CharField(max_length=40)
    contact = models.CharField(max_length=20)
    address = models.CharField(max_length=200)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code
