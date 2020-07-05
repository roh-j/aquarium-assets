from django.contrib import admin
from inventory.models import AquariumStock, StockLedger

# Register your models here.

admin.site.register(AquariumStock)
admin.site.register(StockLedger)
