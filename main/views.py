from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import login, logout, authenticate
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from main.serializers import UserSerializer, AuthSerializer

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, format=None):
        return Response(template_name='main/main-index.html')


class RegisterView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def get(self, request, format=None):
        if request.user.is_authenticated:
            return redirect('Console:IndexView')
        else:
            return Response(template_name='main/main-register.html')

    def post(self, request, format=None):
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


class SignInView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def get(self, request, format=None):
        if request.user.is_authenticated:
            return redirect('Console:IndexView')
        else:
            return Response(template_name='main/main-login.html')

    def post(self, request, format=None):
        serializer = AuthSerializer(data=request.data)

        if serializer.is_valid():
            login(request, serializer.user)
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


class SignOutView(APIView):

    def get(self, request, format=None):
        logout(request)
        return redirect('Main:IndexView')
