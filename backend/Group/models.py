from django.db import models

class Group(models.Model):
    name = models.CharField(max_length=255)
    token = models.CharField(max_length=64, unique=True)
    owner = models.IntegerField()  # user_id of the creator

class UserGroup(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    user_id = models.IntegerField()  # user_id of the member
