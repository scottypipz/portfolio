# Generated by Django 2.1.3 on 2018-11-29 03:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('music', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='music',
            name='audio_path',
            field=models.CharField(default='', max_length=100),
        ),
    ]
