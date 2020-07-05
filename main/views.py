from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from main.models import Business
from . import forms
import json

# Create your views here.


def index(request):
    return render(request=request,
                  template_name='main/index.html')


def register(request):
    form = forms.UserForm()

    return render(request=request,
                  template_name='main/register.html',
                  context={'form': form})


def register_insert(request):
    if request.method == 'POST':
        form = forms.UserForm(request.POST)

        if form.is_valid():
            user = form.save()
            login(request, user)

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))
        else:
            context = {'state': 'error',
                       'messages': '입력된 정보를 다시 확인해주세요.'}
            return HttpResponse(json.dumps(context))


def signin(request):
    if request.user.is_authenticated:
        return redirect('main:business')
    else:
        form = AuthenticationForm()

        return render(request=request,
                    template_name='main/login.html',
                    context={'form': form})


def signin_insert(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(username=username, password=password)

            if user is not None:
                login(request, user)
                context = {'state': 'success'}

                return HttpResponse(json.dumps(context))
        else:
            context = {'state': 'error',
                       'messages': '입력된 정보를 다시 확인해주세요.'}
            return HttpResponse(json.dumps(context))


def signout(request):
    logout(request)
    return redirect('main:index')


def business(request):
    if request.user.is_authenticated:
        business_list = Business.objects.filter(
            user=request.user.id).order_by('-id')

        return render(request=request,
                      template_name='main/business.html',
                      context={'business_list': business_list})
    else:
        return redirect('main:signin')


def business_register(request):
    if request.user.is_authenticated:
        form = forms.BusinessForm()

        return render(request=request,
                      template_name='main/business-register.html',
                      context={'form': form})
    else:
        return redirect('main:signin')


def business_register_insert(request):
    if request.method == 'POST' and request.user.is_authenticated:
        form = forms.BusinessForm(request.POST)

        if form.is_valid():
            form.set_FK(request.user.id)
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))
        else:
            context = {'state': 'error',
                       'messages': '입력된 정보를 다시 확인해주세요.'}
            return HttpResponse(json.dumps(context))
    else:
        context = {'state': 'error',
                   'messages': '로그인이 필요합니다.'}
        return HttpResponse(json.dumps(context))
