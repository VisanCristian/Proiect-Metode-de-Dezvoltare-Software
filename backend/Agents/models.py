from django.db import models
from django.contrib.auth.models import User


class AgentMemory(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_memory')
    excel_subjects = models.TextField(blank=True, null=True)
    poor_subjects = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Agent Memory for {self.user.username}"


class FlashcardPointLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_point_logs')
    points = models.IntegerField(default=1)
    earned_at = models.DateTimeField(auto_now_add=True)
