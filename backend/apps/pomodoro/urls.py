from django.urls import path

from .views import (
    PomodoroCurrentSessionView,
    PomodoroSessionClearView,
    PomodoroSessionDetailView,
    PomodoroSessionListCreateView,
    PomodoroSessionStartView,
    PomodoroTaskDetailView,
    PomodoroTaskListCreateView,
    PomodoroTaskReorderView,
)

urlpatterns = [
    path('sessions/current/', PomodoroCurrentSessionView.as_view(), name='session-current'),
    path('tasks/', PomodoroTaskListCreateView.as_view(), name='task-list'),
    path('tasks/reorder/', PomodoroTaskReorderView.as_view(), name='task-reorder'),
    path('tasks/<uuid:task_id>/', PomodoroTaskDetailView.as_view(), name='task-detail'),
    path('sessions/', PomodoroSessionListCreateView.as_view(), name='session-list'),
    path('sessions/<uuid:session_id>/start/', PomodoroSessionStartView.as_view(), name='session-start'),
    path('sessions/clear/', PomodoroSessionClearView.as_view(), name='session-clear'),
    path('sessions/<uuid:session_id>/', PomodoroSessionDetailView.as_view(), name='session-detail'),
]
