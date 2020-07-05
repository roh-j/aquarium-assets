from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from store.models import StorageRoom, AquariumSection, StoreLayout
from . import forms
import json

# Create your views here.


def index(request, dashboard_id):
    storage_room_form = forms.StorageRoomForm()
    aquarium_section_form = forms.AquariumSectionForm()

    storage_room_list = StorageRoom.objects.filter(
        business=dashboard_id).order_by('-id')

    return render(request=request,
                  template_name='store/store.html',
                  context={'storage_room_form': storage_room_form, 'aquarium_section_form': aquarium_section_form,
                           'storage_room_list': storage_room_list})


def storage_room_insert(request, dashboard_id):
    if request.method == 'POST':
        form = forms.StorageRoomForm(request.POST)

        if form.is_valid():
            form.set_FK(dashboard_id)
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))


def storage_room_update(request, dashboard_id):
    if request.method == 'POST':
        storage_room = StorageRoom.objects.get(id=request.POST['PK'])
        form = forms.StorageRoomForm(request.POST, instance=storage_room)

        if form.is_valid():
            form.set_FK(dashboard_id)
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))


def storage_room_delete(request, dashboard_id):
    if request.method == 'POST':
        StorageRoom.objects.filter(id=request.POST['PK']).delete()

        context = {'state': 'success'}
        return HttpResponse(json.dumps(context))


def aquarium_section_insert(request, dashboard_id):
    if request.method == 'POST':
        form = forms.AquariumSectionForm(request.POST)

        if form.is_valid():
            form.set_FK(request.POST['FK'])
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))


def aquarium_section_update(request, dashboard_id):
    if request.method == 'POST':
        aquarium_section = AquariumSection.objects.get(id=request.POST['PK'])
        form = forms.AquariumSectionForm(
            request.POST, instance=aquarium_section)

        if form.is_valid():
            form.set_FK(request.POST['FK'])
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))


def aquarium_section_delete(request, dashboard_id):
    if request.method == 'POST':
        AquariumSection.objects.filter(id=request.POST['PK']).delete()

        context = {'state': 'success'}
        return HttpResponse(json.dumps(context))


def aquarium_section_async(request, dashboard_id):
    if request.method == 'POST':
        aquarium_section_list = AquariumSection.objects.filter(
            storage_room=request.POST['FK']).order_by('-id')
        context = serializers.serialize('json', aquarium_section_list)

        return HttpResponse(context)


def aquarium_section_async_from_inventory(request, dashboard_id):
    if request.method == 'POST':
        aquarium_section = AquariumSection.objects.get(id=request.POST['PK'])
        context = serializers.serialize('json', [aquarium_section, ])

        return HttpResponse(context)


def store_layout_insert(request, dashboard_id):
    if request.method == 'POST':
        form = forms.StoreLayoutForm(request.POST)

        if form.is_valid():
            form.set_FK(request.POST['FK1'], request.POST['FK2'])
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))


def store_layout_delete(request, dashboard_id):
    if request.method == 'POST':
        StoreLayout.objects.filter(id=request.POST['PK']).delete()

        context = {'state': 'success'}
        return HttpResponse(json.dumps(context))


def store_layout_async(request, dashboard_id):
    if request.method == 'POST':
        row, column, sorted_id, sorted_color, sorted_permission, context = [], [], [], [], [], []
        match = {}

        store_layout_list = StoreLayout.objects.filter(
            storage_room=request.POST['FK']
        )

        if store_layout_list.exists():
            for list in store_layout_list:
                # Nested Dict.
                match[str(list.row)+','+str(list.column)] = {}
                match[str(list.row)+','+str(list.column)
                      ]['id'] = list.id
                match[str(list.row)+','+str(list.column)]['section_color'] = AquariumSection.objects.get(
                    id=str(list.aquarium_section)).section_color

                if (str(list.aquarium_section) == request.POST['section_id']):
                    match[str(list.row)+','+str(list.column)
                          ]['permission'] = True
                else:
                    match[str(list.row)+','+str(list.column)
                          ]['permission'] = False

                row.append(list.row)
                column.append(list.column)

            sorted_row, sorted_column = zip(*sorted(zip(row, column)))

            for i, j in zip(sorted_row, sorted_column):
                sorted_id.append(match[str(i)+','+str(j)]['id'])
                sorted_color.append(match[str(i)+','+str(j)]['section_color'])
                sorted_permission.append(
                    match[str(i)+','+str(j)]['permission'])

            for i, j, k, l, m in zip(sorted_row, sorted_column, sorted_id, sorted_color, sorted_permission):
                context.append(
                    {'row': i, 'column': j, 'id': k, 'color': l, 'permission': m}
                )

            context.insert(0, {'state': 'success'})
        else:
            context.append({'state': 'empty'})

        return HttpResponse(json.dumps(context))


def store_layout_async_from_inventory(request, dashboard_id):
    if request.method == 'POST':
        row, column, sorted_section_id, sorted_color, context = [], [], [], [], []
        match = {}

        store_layout_list = StoreLayout.objects.filter(
            storage_room=request.POST['FK']
        )

        if store_layout_list.exists():
            for list in store_layout_list:
                # Nested Dict.
                match[str(list.row)+','+str(list.column)] = {}
                match[str(list.row)+','+str(list.column)]['section_id'] = AquariumSection.objects.get(
                    id=str(list.aquarium_section)).id
                match[str(list.row)+','+str(list.column)]['section_color'] = AquariumSection.objects.get(
                    id=str(list.aquarium_section)).section_color

                row.append(list.row)
                column.append(list.column)

            sorted_row, sorted_column = zip(*sorted(zip(row, column)))

            for i, j in zip(sorted_row, sorted_column):
                sorted_section_id.append(
                    match[str(i)+','+str(j)]['section_id'])
                sorted_color.append(match[str(i)+','+str(j)]['section_color'])

            for i, j, k, l in zip(sorted_row, sorted_column, sorted_section_id, sorted_color):
                context.append(
                    {'row': i, 'column': j, 'section_id': k, 'color': l}
                )

            context.insert(0, {'state': 'success'})
        else:
            context.append({'state': 'empty'})

        return HttpResponse(json.dumps(context))
