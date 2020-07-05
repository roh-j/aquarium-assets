# Generated by Django 2.2.1 on 2019-08-26 22:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0007_auto_20190826_2145'),
    ]

    operations = [
        migrations.AlterField(
            model_name='unitprice',
            name='scope_of_sales',
            field=models.CharField(choices=[('store_and_online', 'store_and_online'), ('store_only', 'store_only'), ('online_only', 'online_only'), ('not_for_sale', 'not_for_sale')], default='not_for_sale', max_length=20),
        ),
    ]
