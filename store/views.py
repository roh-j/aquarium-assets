from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.core import serializers
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
                  template_name='store/index.html',
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


def aquarium_section_insert(request, dashboard_id):
    if request.method == 'POST':
        form = forms.AquariumSectionForm(request.POST)

        if form.is_valid():
            form.set_FK(request.POST['FK'])
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))


def aquarium_section_async(request, dashboard_id):
    if request.method == 'POST':
        aquarium_section_list = AquariumSection.objects.filter(
            storage_room=request.POST['FK']).order_by('-id')
        context = serializers.serialize('json', aquarium_section_list)

        return HttpResponse(context)


def store_layout_insert(request, dashboard_id):
    if request.method == 'POST':
        form = forms.StoreLayoutForm(request.POST)

        if form.is_valid():
            form.set_FK(request.POST['FK1'], request.POST['FK2'])
            form.save()

            context = {'state': 'success'}
            return HttpResponse(json.dumps(context))


def store_layout_async(request, dashboard_id):
    if request.method == 'POST':
        match = {}
        row, column, sorted_color, context = [], [], [], []

        store_layout_list = StoreLayout.objects.filter(
            storage_room=request.POST['FK']
        )

        for list in store_layout_list:
            match[str(list.row)+','+str(list.column)] = AquariumSection.objects.get(
                id=str(list.aquarium_section)).section_color

            row.append(list.row)
            column.append(list.column)

        sorted_row, sorted_column = zip(*sorted(zip(row, column)))

        for i, j in zip(sorted_row, sorted_column):
            sorted_color.append(match[str(i)+','+str(j)])

        for i, j, k in zip(sorted_row, sorted_column, sorted_color):
            context.append({'row': i, 'column': j, 'color': k})

        context.insert(0, {'state': 'success'})

        return HttpResponse(json.dumps(context))
