from django.db.models import Q
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from console.models import Console
from order.models import Order
from order.serializers import OrderSerializer

# Create your views here.


class PendingOrderView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = Order.objects.filter(
            ~Q(task_status='completed'),
            console=control_number,
        )
        serializer = OrderSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)


class RegisterView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def access_control(self, user_id, control_number):
        console = Console.objects.select_related('business').filter(
            Q(user=user_id) | Q(business__user=user_id) & Q(business__comfirm_business=True),
            id=control_number,
        )

        return console

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            access = self.access_control(request.user.id, control_number)

            if access.exists():
                return Response(template_name='order/order-register.html')
            else:
                return redirect('Main:IndexView')
        else:
            return redirect('Main:SignInView')

    def post(self, request, control_number, format=None):
        serializer = OrderSerializer(data=request.data)
        serializer.set_foreign_key(control_number)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


class StatusView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='order/order-status.html')
        else:
            return redirect('Main:SignInView')
