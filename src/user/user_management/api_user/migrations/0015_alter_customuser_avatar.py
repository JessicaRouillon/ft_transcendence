# Generated by Django 4.2.16 on 2024-10-03 13:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_user', '0014_alter_customuser_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='avatar',
            field=models.ImageField(blank=True, default='media/avatars/default.png', null=True, upload_to='media/avatars/'),
        ),
    ]
