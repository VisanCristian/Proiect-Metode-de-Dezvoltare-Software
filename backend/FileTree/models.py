from django.db import models

# Create your models here.

class Folder(models.Model):
    user = models.IntegerField(default=0)
    name=models.CharField(max_length=255)


class File(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    added_at = models.DateField()
    updated_at=models.DateField()
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)