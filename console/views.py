from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from console.models import Console

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, format=None):
        if request.user.is_authenticated:
            general_console = Console.objects.get(user=request.user.id)
            return Response({'general_console': general_console}, template_name='console/console-enter.html')
        else:
            return redirect('Main:SignInView')
