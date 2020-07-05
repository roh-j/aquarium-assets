from django.contrib import admin
import main.models as MainModels

# Register your models here.

admin.site.register(MainModels.UserLog)
admin.site.register(MainModels.Ticket)
admin.site.register(MainModels.PurchaseTicket)
admin.site.register(MainModels.Profile)
