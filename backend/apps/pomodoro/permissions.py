from rest_framework.permissions import IsAuthenticated


class PomodoroPermission(IsAuthenticated):
    """Require authentication for Pomodoro resources."""

