# Generated by Django 2.2.1 on 2019-07-07 07:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Business',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('registration_number', models.CharField(max_length=20, null=True)),
                ('name_of_company', models.CharField(max_length=40)),
                ('address', models.CharField(max_length=200)),
                ('contact', models.CharField(max_length=20)),
                ('alias', models.CharField(max_length=20)),
                ('confirm', models.BooleanField(default=False)),
                ('publication_date', models.DateTimeField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
