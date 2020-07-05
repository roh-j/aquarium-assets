from django.contrib import admin
from .models import StorageRoom, AquariumSection, StoreLayout

# Register your models here.

admin.site.register(StorageRoom)
admin.site.register(AquariumSection)
admin.site.register(StoreLayout)
