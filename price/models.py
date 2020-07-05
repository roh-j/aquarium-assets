from django.db import models
import business.models as BusinessModels

# Create your models here.


UNIT_CHOICES = (
    ('couple', 'couple'),
    ('male', 'male'),
    ('female', 'female'),
    ('none', 'none'),
)


class UnitPrice(models.Model):
    business = models.ForeignKey(
        BusinessModels.Business,
        on_delete=models.CASCADE
    )
    species = models.CharField(max_length=80)
    breed = models.CharField(max_length=80)
    size = models.FloatField(default=0.0)
    unit = models.CharField(
        max_length=10,
        choices=UNIT_CHOICES,
        default='none'
    )
    price = models.IntegerField(default=0)
    publication_date = models.DateTimeField()

    objects = models.Manager()  # for Visual Studio Code

    def __str__(self):
        return self.breed
