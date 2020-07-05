from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from customer.models import Customer
from customer.serializers import SummarySerializer

# Create your views here.


class SummaryView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = Customer.objects.filter(console=control_number)

        serializer = SummarySerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)
