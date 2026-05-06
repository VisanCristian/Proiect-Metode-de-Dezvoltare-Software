from django.contrib import admin

from .models import PomodoroSession, PomodoroTask


@admin.register(PomodoroSession)
class PomodoroSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'start_time', 'end_time', 'completed_pomodoros', 'points')
    list_filter = ('status', 'auto_start')
    search_fields = ('id',)


@admin.register(PomodoroTask)
class PomodoroTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'session', 'completed', 'estimated_pomodoros', 'actual_pomodoros', 'display_order')
    list_filter = ('completed',)
    search_fields = ('title', 'id')
