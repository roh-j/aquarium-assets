# Generated by Django 2.2.1 on 2019-08-27 13:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0009_auto_20190827_1321'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockrecord',
            name='without_shipping_closing_type',
            field=models.CharField(blank=True, choices=[('parcel_out', 'parcel_out'), ('death', 'death')], max_length=20, null=True),
        ),
    ]
