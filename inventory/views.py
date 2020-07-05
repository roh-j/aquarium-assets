from django.shortcuts import render
from store.models import StorageRoom, AquariumSection, StoreLayout

# Create your views here.


def inventory_selection(request, dashboard_id):
    storage_room_list = StorageRoom.objects.filter(
        business=dashboard_id).order_by('-id')

    return render(request=request,
                  template_name='inventory/inventory-selection.html',
                  context={'storage_room_list': storage_room_list})


def inventory_ordersheet(request, dashboard_id):
    return render(request=request,
                  template_name='inventory/inventory-ordersheet.html')
