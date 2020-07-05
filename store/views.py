from django.db.models import Q
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework.views import APIView
from rest_framework.response import Response
from console.models import Console
from store.models import StorageRoom, AquariumSection, StoreLayout
from store.serializers import StorageRoomSerializer, AquariumSectionSerializer, StoreLayoutSerializer

# Create your views here.


class IndexView(APIView):
    renderer_classes = (TemplateHTMLRenderer,)

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
                items = StorageRoom.objects.filter(console=control_number).order_by('-id')
                return Response({'items': items}, template_name='store/store.html')
            else:
                return redirect('Main:IndexView')
        else:
            return redirect('Main:SignInView')


class StorageRoomView(APIView):
    renderer_classes = (JSONRenderer,)

    def post(self, request, control_number, format=None):
        serializer = StorageRoomSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_foreign_key(control_number)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def put(self, request, control_number, format=None):
        storage_room = StorageRoom.objects.get(id=request.data['pk_storage_room'])
        serializer = StorageRoomSerializer(data=request.data, instance=storage_room)

        if serializer.is_valid():
            serializer.set_foreign_key(control_number)
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        StorageRoom.objects.filter(id=request.data['pk_storage_room']).delete()
        return HttpResponse(status=204)


class AquariumSectionView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        queryset = AquariumSection.objects.filter(storage_room=request.query_params.get('fk_storage_room')).order_by('-id')
        serializer = AquariumSectionSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False, status=200)

    def post(self, request, control_number, format=None):
        serializer = AquariumSectionSerializer(data=request.data)

        if serializer.is_valid():
            serializer.set_foreign_key(request.data['fk_storage_room'])
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def put(self, request, control_number, format=None):
        aquarium_section = AquariumSection.objects.get(id=request.data['pk_aquarium_section'])
        serializer = AquariumSectionSerializer(data=request.data, instance=aquarium_section)

        if serializer.is_valid():
            serializer.set_foreign_key(request.data['fk_storage_room'])
            serializer.save()
            return JsonResponse(serializer.data, safe=False, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        AquariumSection.objects.filter(id=request.data['pk_aquarium_section']).delete()
        return HttpResponse(status=204)


class StoreLayoutView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, control_number, format=None):
        row, column, context = [], [], []
        sorted_id, sorted_color, sorted_permission = [], [], []
        match = {}
        
        queryset = StoreLayout.objects.filter(storage_room=request.query_params.get('fk_storage_room'))

        if queryset.exists():
            for data in queryset:
                # Nested Dict.
                match[str(data.row)+','+str(data.column)] = {}
                match[str(data.row)+','+str(data.column)]['id'] = data.id
                match[str(data.row)+','+str(data.column)]['section_color'] = AquariumSection.objects.get(id=str(data.aquarium_section.id)).section_color

                if (str(data.aquarium_section.id) == request.query_params.get('fk_aquarium_section')):
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
            serializer.set_foreign_key(request.data['fk_storage_room'], request.data['fk_aquarium_section'])
            serializer.save()
            return JsonResponse(serializer.data, status=201)

        return JsonResponse(serializer.errors, status=400)

    def delete(self, request, control_number, format=None):
        StoreLayout.objects.filter(id=request.data['pk_store_layout']).delete()
        return HttpResponse(status=204)
