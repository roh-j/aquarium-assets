from django.contrib import admin
import store.models as StoreModels

# Register your models here.

admin.site.register(StoreModels.StorageRoom)
admin.site.register(StoreModels.AquariumSection)
admin.site.register(StoreModels.StoreLayout)
admin.site.register(StoreModels.Aquarium)
