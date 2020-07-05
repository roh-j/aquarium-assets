from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.conf import settings
from .models import Business
import datetime

# Create your forms here.


class UserForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(required=True)
    last_name = forms.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name',
                  'last_name', 'password1', 'password2',)

    def save(self, commit=True):
        user = super(UserForm, self).save(commit=False)

        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']

        if commit:
            user.save()
        return user


class BusinessForm(forms.ModelForm):

    registration_number = forms.CharField(required=True)
    name_of_company = forms.CharField(required=True)
    address = forms.CharField(required=True)
    contact = forms.CharField(required=True)
    alias = forms.CharField(required=True)

    class Meta:
        model = Business
        fields = ('registration_number',
                  'name_of_company', 'address', 'contact', 'alias',)

    def set_FK(self, key):
        self.FK = key

    def save(self, commit=True):
        business = super(BusinessForm, self).save(commit=False)

        business.user = User.objects.get(id=self.FK)
        business.registration_number = self.cleaned_data['registration_number']
        business.name_of_company = self.cleaned_data['name_of_company']
        business.address = self.cleaned_data['address']
        business.contact = self.cleaned_data['contact']
        business.alias = self.cleaned_data['alias']
        business.publication_date = datetime.datetime.now()

        if commit:
            business.save()
        return business
