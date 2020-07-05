from django.db.models import Sum, Count, F, Q
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from product.models import Creature, UnitPrice
from inventory.models import AquariumStock
from product.serializers import CreatureSerializer, UnitPriceSerializer

# Create your views here.


class IndexView(APIView):
    renderer_classes = (JSONRenderer, TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            return Response(template_name='product/product.html')
        else:
            return redirect('Main:SignInView')

    def post(self, request, control_number, format=None):
        serializer = UnitPriceSerializer(data=request.data)
        serializer.set_foreign_key(control_number)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


class CreatureView(APIView):
    def get(self, request, control_number, format=None):
        queryset = Creature.objects.filter(console=control_number).order_by('-id')
        serializer = CreatureSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)


class UnitPriceView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = UnitPrice.objects.filter(console=control_number).select_related('creature').order_by('-id')
        context = list(queryset.values('creature__species', 'creature__breed', 'creature__remark',
                                       'id', 'min_size', 'max_size', 'stages_of_development', 'unit', 'price', 'scope_of_sales'))
        return JsonResponse(context, safe=False, status=200)


class StockView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = AquariumStock.objects.values('unit_price').annotate(
            creature__species=F('unit_price__creature__species'),
            creature__breed=F('unit_price__creature__breed'),
            creature__remark=F('unit_price__creature__remark'),
            unit_price__min_size=F('unit_price__min_size'),
            unit_price__max_size=F('unit_price__max_size'),
            unit_price__stages_of_development=F('unit_price__stages_of_development'),
            unit=F('gender'),
            unit_price__price=F('unit_price__price'),
            remaining_quantity=Sum('quantity') - F('unit_price__order_quantity'),
        ).filter(
            Q(unit_price__scope_of_sales='store_and_online') | Q(unit_price__scope_of_sales='store_only'),
            console=control_number,
            unit_price__isnull=False,
            remaining_quantity__gte=1,
        )

        context = list(queryset)

        return JsonResponse(context, safe=False, status=200)
