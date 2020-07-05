from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
import store.models as StoreModels
import store.serializers as StoreSerializers

# Create your views here.


class ManualView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            queryset = StoreModels.StorageRoom.objects.filter(
                business=control_number).order_by('-id')
            return Response({'storage_room_list': queryset}, template_name='inventory/inventory-manual.html')
        else:
            return redirect('Main:SignInView')


class StoreLayoutView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        row, column, context = [], [], []
        sorted_id, sorted_color = [], []
        match = {}

        queryset = StoreModels.StoreLayout.objects.filter(
            storage_room=request.query_params.get('FK')
        )

        if queryset.exists():
            for data in queryset:
                # Nested Dict.
                match[str(data.row)+','+str(data.column)] = {}
                match[str(data.row)+','+str(data.column)]['section_id'] = StoreModels.AquariumSection.objects.get(
                    pk=str(data.aquarium_section.pk)).pk
                match[str(data.row)+','+str(data.column)]['section_color'] = StoreModels.AquariumSection.objects.get(
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

    def get(self, request, control_number, format=None):
        queryset = StoreModels.AquariumSection.objects.get(
            pk=request.query_params.get("PK"))

        serializer = StoreSerializers.AquariumSectionSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, status=200)


class AquariumView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = StoreModels.Aquarium.objects.get(
            aquarium_section=request.query_params.get("FK"), row=request.query_params.get("row"), column=request.query_params.get("column"))

        serializer = StoreSerializers.AquariumSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, status=200)
