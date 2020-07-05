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
    path('ajax/insert/aquarium-section/',
         views.aquarium_section_insert, name='aquarium_section_insert'),
    path('ajax/async/aquarium-section/',
         views.aquarium_section_async, name='aquarium_section_async'),
    path('ajax/insert/store-layout/',
         views.store_layout_insert, name='store_layout_insert'),
    path('ajax/async/store-layout/',
         views.store_layout_async, name='store_layout_async'),
]
