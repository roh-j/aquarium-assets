from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from store.models import StorageRoom, AquariumSection, StoreLayout
from store.serializers import StorageRoomSerializer, AquariumSectionSerializer, StoreLayoutSerializer

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

    def get(self, request, control_number, format=None):
        if request.user.is_authenticated:
            items = StorageRoom.objects.filter(console=control_number).order_by('-id')
            return Response({'items': items}, template_name='store/store.html')
        else:
            return redirect('Main:SignInView')


class StorageRoomView(APIView):
    renderer_classes = (JSONRenderer,)

    def post(self, request, control_number, format=None):
        serializer = StorageRoomSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_FK(control_number)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def put(self, request, control_number, format=None):
        storage_room = StorageRoom.objects.get(id=request.data['PK'])
        serializer = StorageRoomSerializer(data=request.data, instance=storage_room)

        if serializer.is_valid():
            serializer.set_FK(control_number)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        StorageRoom.objects.filter(id=request.data['PK']).delete()
        return HttpResponse(status=204)


class AquariumSectionView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = AquariumSection.objects.filter(storage_room=request.query_params.get('FK')).order_by('-id')
        serializer = AquariumSectionSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)

    def post(self, request, control_number, format=None):
        serializer = AquariumSectionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_FK(request.data['FK'])
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def put(self, request, control_number, format=None):
        aquarium_section = AquariumSection.objects.get(id=request.data['PK'])
        serializer = AquariumSectionSerializer(data=request.data, instance=aquarium_section)

        if serializer.is_valid():
            serializer.set_FK(request.data['FK'])
            serializer.save()
            return JsonResponse(serializer.data, safe=False, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        AquariumSection.objects.filter(id=request.data['PK']).delete()
        return HttpResponse(status=204)


class StoreLayoutView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        row, column, context = [], [], []
        sorted_id, sorted_color, sorted_permission = [], [], []
        match = {}
        
        queryset = StoreLayout.objects.filter(storage_room=request.query_params.get('FK1'))

        if queryset.exists():
            for data in queryset:
                # Nested Dict.
                match[str(data.row)+','+str(data.column)] = {}
                match[str(data.row)+','+str(data.column)]['id'] = data.id
                match[str(data.row)+','+str(data.column)]['section_color'] = AquariumSection.objects.get(id=str(data.aquarium_section.id)).section_color

                if (str(data.aquarium_section.id) == request.query_params.get('FK2')):
                    match[str(data.row)+','+str(data.column)]['permission'] = True
                else:
                    match[str(data.row)+','+str(data.column)]['permission'] = False

                row.append(data.row)
                column.append(data.column)

            sorted_row, sorted_column = zip(*sorted(zip(row, column)))

            for i, j in zip(sorted_row, sorted_column):
                sorted_id.append(match[str(i)+','+str(j)]['id'])
                sorted_color.append(match[str(i)+','+str(j)]['section_color'])
                sorted_permission.append(match[str(i)+','+str(j)]['permission'])

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
        serializer = StoreLayoutSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_FK(request.data['FK1'], request.data['FK2'])
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        StoreLayout.objects.filter(id=request.data['PK']).delete()
        return HttpResponse(status=204)
