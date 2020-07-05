from django.shortcuts import render
from store.models import StorageRoom, AquariumSection, StoreLayout

# Create your views here.


def index(request, dashboard_id):
    storage_room_list = StorageRoom.objects.filter(
        business=dashboard_id).order_by('-id')

    return render(request=request,
                  template_name='inventory/index.html',
                  context={'storage_room_list': storage_room_list})
