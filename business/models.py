from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.


class Business(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    name_of_company = models.CharField(max_length=40)
    registration_number = models.CharField(max_length=20, unique=True)
    address = models.CharField(max_length=200)
    contact = models.CharField(max_length=20)
    alias = models.CharField(max_length=20, unique=True)
    confirm_business = models.BooleanField(default=False)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code
