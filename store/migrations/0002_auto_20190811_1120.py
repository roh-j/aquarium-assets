# Generated by Django 2.2.1 on 2019-08-11 11:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='aquarium',
            name='alias',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='aquarium',
            name='memo',
            field=models.TextField(blank=True, null=True),
        ),
    ]
