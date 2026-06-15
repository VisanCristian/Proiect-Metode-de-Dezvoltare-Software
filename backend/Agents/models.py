from django.db import models
from django.contrib.auth.models import User

class AgentMemory(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_memory')
    excel_subjects = models.TextField(blank=True, null=True, help_text="Subjects the user excels at")
    poor_subjects = models.TextField(blank=True, null=True, help_text="Subjects the user does poorly at")
    notes = models.TextField(blank=True, null=True, help_text="Agent notes about the user")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Agent Memory for {self.user.username}"
