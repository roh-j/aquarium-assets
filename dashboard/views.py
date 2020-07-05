from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.db.models import Q
from django.contrib import messages
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from console.models import Console

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def access_control(self, user_id, control_number):
        console = Console.objects.select_related('business').filter(
            Q(user=user_id) | Q(business__user=user_id) & Q(business__confirm_business=True),
            id=control_number,
        )

        return console

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            access = self.access_control(request.user.id, control_number)

            if access.exists():
                return Response(template_name='dashboard/dashboard.html')
            else:
                messages.warning(request, '비즈니스 승인이 필요하거나 잘못된 접근입니다.')
                return redirect('Console:IndexView')
        else:
            return redirect('Main:SignInView')
