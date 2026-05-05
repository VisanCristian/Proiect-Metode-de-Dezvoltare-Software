import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class PomodoroSession(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        ENDED = 'ended', 'Ended'
        ABANDONED = 'abandoned', 'Abandoned'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='pomodoro_sessions',
    )
    start_time = models.DateTimeField(null=True, blank=True, db_index=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    focus_time = models.PositiveIntegerField(default=25 * 60, validators=[MinValueValidator(1)])
    break_time = models.PositiveIntegerField(default=5 * 60, validators=[MinValueValidator(1)])
    long_break_time = models.PositiveIntegerField(default=15 * 60, validators=[MinValueValidator(1)])
    cycles_before_long_break = models.PositiveIntegerField(default=4, validators=[MinValueValidator(1)])
    auto_start = models.BooleanField(default=False)
    total_focus_time = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    total_break_time = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    completed_pomodoros = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    points = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pomodoro_sessions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['start_time']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'PomodoroSession({self.id}, {self.status})'


class PomodoroTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='pomodoro_tasks',
    )
    session = models.ForeignKey(
        PomodoroSession,
        on_delete=models.CASCADE,
        related_name='tasks',
    )
    title = models.CharField(max_length=255)
    estimated_pomodoros = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    actual_pomodoros = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    completed = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'pomodoro_tasks'
        ordering = ['display_order', 'created_at']
        indexes = [
            models.Index(fields=['session']),
            models.Index(fields=['user']),
            models.Index(fields=['display_order']),
        ]

    def __str__(self):
        return f'PomodoroTask({self.title})'
