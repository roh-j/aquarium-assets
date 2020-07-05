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

app_name = 'main'

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('register/ajax/insert/', views.register_insert, name='register_insert'),
    path('login/', views.signin, name='signin'),
    path('login/ajax/insert/', views.signin_insert, name='signin_insert'),
    path('logout/', views.signout, name='signout'),
    path('business/', views.business, name='business'),
    path('business/register/', views.business_register, name='business_register'),
    path('business/register/ajax/insert/',
         views.business_register_insert, name='business_register_insert'),
]
