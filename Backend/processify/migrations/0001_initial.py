# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Process',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('p_name', models.CharField(max_length=100)),
                ('p_description', models.TextField()),
                ('p_flow', models.TextField()),
                ('p_status', models.SmallIntegerField(choices=[(0, 'Draft'), (1, 'Private'), (2, 'Restricted'), (3, 'Public')])),
                ('p_owner', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
                ('p_parent', models.ForeignKey(null=True, to='processify.Process')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('j_priority', models.SmallIntegerField(choices=[(0, 'Urgent and Important'), (1, 'Urgent but not Important'), (2, 'Important but not Urgent'), (3, 'neither Important nor Urgent')])),
                ('j_process', models.ForeignKey(to='processify.Process')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(serialize=False, verbose_name='ID', primary_key=True, auto_created=True)),
                ('t_name', models.CharField(max_length=100)),
                ('t_description', models.TextField()),
                ('t_type', models.CharField(max_length=1, choices=[('X', 'Execute'), ('V', 'Evaluate')])),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
