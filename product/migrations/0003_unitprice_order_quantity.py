# Generated by Django 2.2.1 on 2019-08-16 16:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0002_auto_20190815_1325'),
    ]

    operations = [
        migrations.AddField(
            model_name='unitprice',
            name='order_quantity',
            field=models.IntegerField(default=0),
        ),
    ]