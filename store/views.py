from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
import store.serializers as StoreSerializers
import store.models as StoreModels

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            queryset = StoreModels.StorageRoom.objects.filter(
                business=control_number).order_by('-id')
            return Response({'storage_room_list': queryset}, template_name='store/store.html')
        else:
            return redirect('Main:SignInView')


class StorageRoomView(APIView):
    renderer_classes = (JSONRenderer,)

    def post(self, request, control_number, format=None):
        serializer = StoreSerializers.StorageRoomSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_FK(control_number)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def put(self, request, control_number, format=None):
        storage_room = StoreModels.StorageRoom.objects.get(
            pk=request.data['PK'])
        serializer = StoreSerializers.StorageRoomSerializer(
            data=request.data, instance=storage_room)

        if serializer.is_valid():
            serializer.set_FK(control_number)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        StoreModels.StorageRoom.objects.filter(pk=request.data['PK']).delete()
        return HttpResponse(status=204)


class AquariumSectionView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = StoreModels.AquariumSection.objects.filter(
            storage_room=request.query_params.get('FK')
        ).order_by('-id')

        serializer = StoreSerializers.AquariumSectionSerializer(
            queryset, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)

    def post(self, request, control_number, format=None):
        serializer = StoreSerializers.AquariumSectionSerializer(
            data=request.data)

        if serializer.is_valid():
            serializer.set_FK(request.data['FK'])
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def put(self, request, control_number, format=None):
        aquarium_section = StoreModels.AquariumSection.objects.get(
            pk=request.data['PK'])
        serializer = StoreSerializers.AquariumSectionSerializer(
            data=request.data, instance=aquarium_section)

        if serializer.is_valid():
            serializer.set_FK(request.data['FK'])
            serializer.save()
            return JsonResponse(serializer.data, safe=False, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        StoreModels.AquariumSection.objects.filter(
            pk=request.data['PK']).delete()
        return HttpResponse(status=204)


class StoreLayoutView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        row, column, context = [], [], []
        sorted_id, sorted_color, sorted_permission = [], [], []
        match = {}

        queryset = StoreModels.StoreLayout.objects.filter(
            storage_room=request.query_params.get('FK1')
        )

        if queryset.exists():
            for data in queryset:
                # Nested Dict.
                match[str(data.row)+','+str(data.column)] = {}
                match[str(data.row)+','+str(data.column)]['id'] = data.id
                match[str(data.row)+','+str(data.column)]['section_color'] = StoreModels.AquariumSection.objects.get(
                    pk=str(data.aquarium_section.pk)).section_color

                if (str(data.aquarium_section.pk) == request.query_params.get('FK2')):
                    match[str(data.row)+','+str(data.column)
                          ]['permission'] = True
                else:
                    match[str(data.row)+','+str(data.column)
                          ]['permission'] = False

                row.append(data.row)
                column.append(data.column)

            sorted_row, sorted_column = zip(*sorted(zip(row, column)))

            for i, j in zip(sorted_row, sorted_column):
                sorted_id.append(match[str(i)+','+str(j)]['id'])
                sorted_color.append(match[str(i)+','+str(j)]['section_color'])
                sorted_permission.append(
                    match[str(i)+','+str(j)]['permission'])

            for i, j, k, l, m in zip(sorted_row, sorted_column, sorted_id, sorted_color, sorted_permission):
                context.append(
                    {
                        'row': i,
                        'column': j,
                        'id': k,
                        'color': l,
                        'permission': m
                    }
                )
            return JsonResponse(context, safe=False, status=200)

        return JsonResponse(context, safe=False, status=200)

    def post(self, request, control_number, format=None):
        serializer = StoreSerializers.StoreLayoutSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_FK(request.data['FK1'], request.data['FK2'])
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        StoreModels.StoreLayout.objects.filter(pk=request.data['PK']).delete()
        return HttpResponse(status=204)
