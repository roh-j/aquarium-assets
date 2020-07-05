from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.


class RegisterView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='order/order-register.html')
        else:
            return redirect('Main:SignInView')


class ListView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='order/order-list.html')
        else:
            return redirect('Main:SignInView')