from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib import messages
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from main.models import Profile
from console.models import Console
from business.serializers import BusinessSerializer

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def access_control(self, user_id):
        try:
            profile = Profile.objects.get(id=user_id, membership='business')
        except ObjectDoesNotExist:
            profile = None

        return profile

    def get(self, request, format=None):
        if request.user.is_authenticated:
            access = self.access_control(request.user.id)

            if access is not None:
                items = Console.objects.select_related('business').filter(business__user=request.user.id).order_by('-id')
                return Response({'items': items}, template_name='business/business-list.html')
            else:
                messages.warning(request, '일반 사용자는 비즈니스를 관리할 수 없습니다.')
                return redirect('Console:IndexView')
        else:
            return redirect('Main:SignInView')


class RegisterView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def access_control(self, user_id):
        try:
            profile = Profile.objects.get(id=user_id, membership='business')
        except ObjectDoesNotExist:
            profile = None

        return profile

    def get(self, request, format=None):
        if request.user.is_authenticated:
            access = self.access_control(request.user.id)

            if access is not None:
                return Response(template_name='business/business-register.html')
            else:
                messages.warning(request, '일반 사용자는 비즈니스를 관리할 수 없습니다.')
                return redirect('Console:IndexView')
        else:
            return redirect('Main:SignInView')

    def post(self, request, format=None):
        serializer = BusinessSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_foreign_key(request.user.id)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)
