"""mysite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from . import views

app_name = 'store'

urlpatterns = [
    path('', views.index, name='index'),
    path('ajax/insert/storage-room/',
         views.storage_room_insert, name='storage_room_insert'),
    path('ajax/update/storage-room/',
         views.storage_room_update, name='storage_room_update'),
    path('ajax/delete/storage-room/',
         views.storage_room_delete, name='storage_room_delete'),
    path('ajax/insert/aquarium-section/',
         views.aquarium_section_insert, name='aquarium_section_insert'),
    path('ajax/update/aquarium-section/',
         views.aquarium_section_update, name='aquarium_section_update'),
    path('ajax/delete/aquarium-section/',
         views.aquarium_section_delete, name='aquarium_section_delete'),
    path('ajax/async/aquarium-section/',
         views.aquarium_section_async, name='aquarium_section_async'),
    path('ajax/async-from-inventory/aquarium-section/',
         views.aquarium_section_async_from_inventory, name='aquarium_section_async_from_inventory'),
    path('ajax/insert/store-layout/',
         views.store_layout_insert, name='store_layout_insert'),
    path('ajax/delete/store-layout/',
         views.store_layout_delete, name='store_layout_delete'),
    path('ajax/async/store-layout/',
         views.store_layout_async, name='store_layout_async'),
    path('ajax/async-from-inventory/store-layout/',
         views.store_layout_async_from_inventory, name='store_layout_async_from_inventory'),
]
