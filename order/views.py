from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from order.serializers import OrderSerializer

# Create your views here.


class RegisterView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='order/order-register.html')
        else:
            return redirect('Main:SignInView')

    def post(self, request, control_number, format=None):
        serializer = OrderSerializer(data=request.data)
        serializer.set_FK(control_number)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)
