from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, Http404
from django.contrib.auth import authenticate
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from store.models import StorageRoom, AquariumSection, StoreLayout, Aquarium
from store.serializers import AquariumSectionSerializer, AquariumSerializer

# Create your views here.


class PriceView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, management_id, format=None):
        if request.user.is_authenticated:
            return Response(template_name='inventory/inventory-price.html')
        else:
            return redirect('main:SignInView')


class SelectionView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, management_id, format=None):
        if request.user.is_authenticated:
            queryset = StorageRoom.objects.filter(
                business=management_id).order_by('-id')
            return Response({'storage_room_list': queryset}, template_name='inventory/inventory-selection.html')
        else:
            return redirect('main:SignInView')


class StoreLayoutView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, management_id, format=None):
        row, column, context = [], [], []
        sorted_id, sorted_color = [], []
        match = {}

        queryset = StoreLayout.objects.filter(
            storage_room=request.query_params.get('FK')
        )

        if queryset.exists():
            for data in queryset:
                # Nested Dict.
                match[str(data.row)+','+str(data.column)] = {}
                match[str(data.row)+','+str(data.column)]['section_id'] = AquariumSection.objects.get(
                    pk=str(data.aquarium_section.pk)).pk
                match[str(data.row)+','+str(data.column)]['section_color'] = AquariumSection.objects.get(
                    pk=str(data.aquarium_section.pk)).section_color

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

    def get(self, request, management_id, format=None):
        queryset = AquariumSection.objects.get(pk=request.query_params.get("PK"))

        serializer = AquariumSectionSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, status=200)


class AquariumView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, management_id, format=None):
        queryset = Aquarium.objects.get(
            aquarium_section=request.query_params.get("FK"), row=request.query_params.get("row"), column=request.query_params.get("column"))

        serializer = AquariumSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, status=200)
