# Generated by Django 2.2.1 on 2019-08-11 11:46

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('console', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shipping_type', models.CharField(choices=[('in_store', 'in_store'), ('delivery', 'delivery')], default='in_store', max_length=20)),
                ('tracking_number', models.CharField(blank=True, max_length=30, null=True)),
                ('order_status', models.CharField(choices=[('activate', 'activate'), ('inactivate', 'inactivate')], default='activate', max_length=20)),
                ('task_status', models.CharField(choices=[('not_started', 'not_started'), ('in_progress', 'in_progress'), ('completed', 'completed')], default='not_started', max_length=20)),
                ('order_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('console', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='console.Console')),
            ],
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('species', models.CharField(max_length=100)),
                ('breed', models.CharField(max_length=100)),
                ('min_size', models.FloatField(default=0.0)),
                ('max_size', models.FloatField(default=0.0)),
                ('stages_of_development', models.CharField(choices=[('adult', 'adult'), ('immature', 'immature'), ('juvenile', 'juvenile'), ('larva', 'larva')], default='adult', max_length=20)),
                ('unit', models.CharField(choices=[('none', 'none'), ('female', 'female'), ('male', 'male')], default='none', max_length=20)),
                ('price', models.IntegerField(default=0)),
                ('quantity', models.IntegerField(default=1)),
                ('remaining_order_quantity', models.IntegerField(default=1)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='order.Order')),
            ],
        ),
    ]