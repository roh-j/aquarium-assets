# Generated by Django 2.2.1 on 2019-07-09 03:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='aquarium',
            name='alias',
            field=models.CharField(max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='aquarium',
            name='memo',
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name='aquarium',
            name='ph',
            field=models.FloatField(default=7.0, null=True),
        ),
        migrations.AlterField(
            model_name='aquarium',
            name='state',
            field=models.CharField(max_length=20, null=True),
        ),
    ]
