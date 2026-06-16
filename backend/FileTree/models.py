from django.db import models
from django.contrib.auth.models import User
import secrets

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
    is_encrypted = models.BooleanField(default=False)


def generate_encryption_token():
    return secrets.token_hex(32)


class EncryptionKey(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='encryption_key')
    token = models.CharField(max_length=128, default=generate_encryption_token)

    def __str__(self):
        return f"EncryptionKey for {self.user.username}"