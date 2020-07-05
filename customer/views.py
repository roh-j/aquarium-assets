from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.


class ListView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='customer/customer-list.html')
        else:
            return redirect('Main:SignInView')


class ServiceView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='customer/customer-service.html')
        else:
            return redirect('Main:SignInView')
