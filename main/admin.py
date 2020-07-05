from django.contrib import admin
from main.models import Ticket, PurchaseTicket, Profile

# Register your models here.

admin.site.register(Ticket)
admin.site.register(PurchaseTicket)
admin.site.register(Profile)
