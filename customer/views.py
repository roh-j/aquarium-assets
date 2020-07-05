from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, Http404
from django.contrib.auth import authenticate
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Create your views here.


class ListView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, management_id, format=None):
        if request.user.is_authenticated:
            return Response(template_name='customer/customer-list.html')
        else:
            return redirect('main:SignInView')


class ServiceView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, management_id, format=None):
        if request.user.is_authenticated:
            return Response(template_name='customer/customer-service.html')
        else:
            return redirect('main:SignInView')
