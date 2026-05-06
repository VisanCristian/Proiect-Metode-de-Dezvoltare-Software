from django.db.models import Q

from .models import PomodoroSession, PomodoroTask


def _filter_for_user(queryset, user=None):
    if user is None:
        return queryset.filter(user__isnull=True)
    return queryset.filter(user=user)


def get_current_draft_session(user=None):
    queryset = _filter_for_user(PomodoroSession.objects.prefetch_related('tasks'), user=user)
    return queryset.filter(status=PomodoroSession.Status.DRAFT).order_by('-created_at').first()


def get_current_session(user=None):
    queryset = _filter_for_user(PomodoroSession.objects.prefetch_related('tasks'), user=user)
    return queryset.filter(
        Q(status=PomodoroSession.Status.ACTIVE) | Q(status=PomodoroSession.Status.DRAFT)
    ).order_by('status', '-created_at').first()


def get_or_create_draft_session(user=None):
    session = get_current_draft_session(user=user)
    if session is None:
        session = PomodoroSession.objects.create(user=user)
    return session


def list_tasks(session_id=None, user=None):
    queryset = _filter_for_user(PomodoroTask.objects.select_related('session'), user=user)
    if session_id is not None:
        queryset = queryset.filter(session_id=session_id)
    return queryset.order_by('display_order', 'created_at')


def get_task_by_id(task_id, user=None):
    queryset = _filter_for_user(PomodoroTask.objects.select_related('session'), user=user)
    return queryset.filter(id=task_id).first()


def list_sessions(user=None):
    queryset = _filter_for_user(PomodoroSession.objects.prefetch_related('tasks'), user=user)
    return queryset.filter(status=PomodoroSession.Status.ENDED).order_by('-start_time', '-created_at')


def get_session_by_id(session_id, user=None):
    queryset = _filter_for_user(PomodoroSession.objects.prefetch_related('tasks'), user=user)
    return queryset.filter(id=session_id).first()
