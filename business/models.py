from django.db import models
from django.conf import settings

# Create your models here.


class Business(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    registration_number = models.CharField(max_length=20, null=True)
    name_of_company = models.CharField(max_length=40)
    address = models.CharField(max_length=200)
    contact = models.CharField(max_length=20)
    alias = models.CharField(max_length=20)
    confirm = models.BooleanField(default=False)
    publication_date = models.DateTimeField()

    objects = models.Manager()  # VS Code 버그 해결을 위한 코드

    def __str__(self):
        return self.name_of_company
