from django.shortcuts import render

# Create your views here.


def customer_list(request, dashboard_id):
    return render(request=request,
                  template_name='customer/customer-list.html')


def customer_service(request, dashboard_id):
    return render(request=request,
                  template_name='customer/customer-service.html')
