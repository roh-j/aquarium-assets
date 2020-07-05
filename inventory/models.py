from django.db import models
from django.utils import timezone
from store.models import Aquarium
from console.models import Console
from product.models import Creature, UnitPrice

# Create your models here.

GENDER_CHOICES = (
    ('none', 'none'),
    ('female', 'female'),
    ('male', 'male'),
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
    remark = models.CharField(max_length=200, null=True, blank=True)
    size = models.FloatField(default=0.0)
    quantity = models.IntegerField(default=1)
    last_modified_date = models.DateTimeField(default=timezone.now)
    creation_date = models.DateTimeField(default=timezone.now)

    objects = models.Manager()  # for Visual Studio Code
