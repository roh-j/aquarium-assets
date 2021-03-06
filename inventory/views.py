from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.db.models import Q, Case, When, Value, CharField
from django.contrib import messages
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from console.models import Console
from store.models import StorageRoom, AquariumSection, StoreLayout, Aquarium
from inventory.models import AquariumStock
from store.serializers import StorageRoomSerializer, AquariumSectionSerializer, StoreLayoutSerializer, AquariumSerializer
from inventory.serializers import AquariumStockSerializer, GoodsIssueSerializer, GoodsReceiptSerializer

# Create your views here.


class ManualView(APIView):
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
                queryset = StorageRoom.objects.filter(console=control_number).order_by('-id')
                return Response({'storage_room_list': queryset}, template_name='inventory/inventory-manual.html')
            else:
                messages.warning(request, '비즈니스 승인이 필요하거나 잘못된 접근입니다.')
                return redirect('Console:IndexView')
        else:
            return redirect('Main:SignInView')


class StoreLayoutView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        row, column, context = [], [], []
        sorted_id, sorted_color = [], []
        match = {}

        queryset = StoreLayout.objects.filter(storage_room=request.query_params.get('fk_storage_room'))

        if queryset.exists():
            for data in queryset:
                # Nested Dict.
                match[str(data.row)+','+str(data.column)] = {}
                match[str(data.row)+','+str(data.column)]['section_id'] = AquariumSection.objects.get(id=str(data.aquarium_section.id)).id
                match[str(data.row)+','+str(data.column)]['section_color'] = AquariumSection.objects.get(id=str(data.aquarium_section.id)).section_color

                row.append(data.row)
                column.append(data.column)

            sorted_row, sorted_column = zip(*sorted(zip(row, column)))

            for i, j in zip(sorted_row, sorted_column):
                sorted_id.append(match[str(i)+','+str(j)]['section_id'])
                sorted_color.append(match[str(i)+','+str(j)]['section_color'])

            for i, j, k, l in zip(sorted_row, sorted_column, sorted_id, sorted_color):
                context.append(
                    {
                        'row': i,
                        'column': j,
                        'section_id': k,
                        'color': l
                    }
                )
            return JsonResponse(context, safe=False, status=200)

        return JsonResponse(context, safe=False, status=200)


class AquariumSectionView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = AquariumSection.objects.get(id=request.query_params.get('pk_aquarium_section'))

        serializer = AquariumSectionSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, status=200)


class AquariumView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = Aquarium.objects.get(
            aquarium_section=request.query_params.get('fk_aquarium_section'),
            row=request.query_params.get('row'),
            column=request.query_params.get('column'),
        )

        serializer = AquariumSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, status=200)


class AquariumStockView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = AquariumStock.objects.select_related('creature').annotate(
            status=Case(
                When(
                    unit_price__isnull=True,
                    then=Value('unavailable'),
                ),
                default=Value('available'),
                output_field=CharField(),
            )
        ).filter(aquarium=request.query_params.get('fk_aquarium')).order_by('-id')
        context = list(queryset.values('id', 'creature__species', 'creature__breed',
                                       'creature__remark', 'size', 'gender', 'quantity', 'status'))
        return JsonResponse(context, safe=False, status=200)

    def post(self, request, control_number, format=None):
        serializer = AquariumStockSerializer(data=request.data)
        serializer.set_foreign_key(control_number, request.data['fk_aquarium'])

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


class GoodsIssueView(APIView):
    renderer_classes = (JSONRenderer,)

    def post(self, request, control_number, format=None):
        serializer = GoodsIssueSerializer(data=request.data)
        serializer.set_foreign_key(control_number, request.data['fk_aquarium'], request.data['fk_aquarium_stock'])

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)


class GoodsReceiptView(APIView):
    renderer_classes = (JSONRenderer,)

    def post(self, request, control_number, format=None):
        serializer = GoodsReceiptSerializer(data=request.data)
        serializer.set_foreign_key(control_number, request.data['fk_aquarium'], request.data['fk_aquarium_stock'])

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)
