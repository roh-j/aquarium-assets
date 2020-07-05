from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.db.models import Count
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
import price.models as PriceModels
import price.serializers as PriceSerializers

# Create your views here.


class IndexView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='price/price.html')
        else:
            return redirect('Main:SignInView')

    def post(self, request, control_number, format=None):
        serializer = PriceSerializers.UnitPriceSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_FK(control_number)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


class UnitPriceView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = PriceModels.UnitPrice.objects.filter(
            business=control_number
        ).order_by('-id')

        serializer = PriceSerializers.UnitPriceSerializer(
            queryset, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)


class SpeciesView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = PriceModels.UnitPrice.objects.filter(
            business=control_number
        ).values('species').annotate(count=Count('species'))

        serializer = PriceSerializers.SpeciesSerializer(
            queryset, many=True
        )

        return JsonResponse(serializer.data, safe=False, status=200)

class BreedView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = PriceModels.UnitPrice.objects.filter(
            business=control_number
        ).values('breed').annotate(count=Count('breed'))

        serializer = PriceSerializers.BreedSerializer(
            queryset, many=True
        )

        return JsonResponse(serializer.data, safe=False, status=200)
