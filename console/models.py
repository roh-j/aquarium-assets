from django.db import models
from django.conf import settings
from business.models import Business

# Create your models here.


class Console(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    business = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    objects = models.Manager()  # for Visual Studio Code
