# Generated by Django 4.2.16 on 2024-09-25 16:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api_user', '0005_customuser_password2_alter_customuser_password'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='password1',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='password2',
        ),
    ]
