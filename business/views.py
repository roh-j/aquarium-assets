from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, Http404
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .serializers import BusinessSerializer
from .models import Business

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, format=None):
        if request.user.is_authenticated:
            business_list = Business.objects.filter(user=request.user.id).order_by('-id')
            return Response({'business_list': business_list}, template_name='business/business.html')
        else:
            return redirect('main:SignInView')


class RegisterView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response(template_name='business/business-register.html')
        else:
            return redirect('main:SignInView')

    def post(self, request, format=None):
        serializer = BusinessSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_FK(request.user.id)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)
