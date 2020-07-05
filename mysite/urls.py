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
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('main.urls')),
    path('business/', include('business.urls')),
    path('console/<int:control_number>/dashboard/', include('dashboard.urls')),
    path('console/<int:control_number>/store/', include('store.urls')),
    path('console/<int:control_number>/price/', include('price.urls')),
    path('console/<int:control_number>/order/', include('order.urls')),
    path('console/<int:control_number>/inventory/', include('inventory.urls')),
    path('console/<int:control_number>/customer/', include('customer.urls')),
]
