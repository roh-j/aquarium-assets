# Generated by Django 2.2.1 on 2019-08-15 13:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0002_auto_20190815_1325'),
        ('inventory', '0004_auto_20190815_1325'),
    ]

    operations = [
        migrations.AddField(
            model_name='aquariumstock',
            name='unit_price',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='product.UnitPrice'),
        ),
    ]
