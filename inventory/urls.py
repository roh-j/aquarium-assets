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

app_name = 'Inventory'

urlpatterns = [
    path('manual/', views.ManualView.as_view(), name='ManualView'),
    path('manual/store-layout/',
         views.StoreLayoutView.as_view(), name='StoreLayoutView'),
    path('manual/aquarium-section/',
         views.AquariumSectionView.as_view(), name='AquariumSectionView'),
    path('manual/aquarium/', views.AquariumView.as_view(), name='AquariumView'),
]
