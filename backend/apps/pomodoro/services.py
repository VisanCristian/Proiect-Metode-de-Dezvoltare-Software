from django.db import transaction
from django.utils import timezone

from .models import PomodoroSession, PomodoroTask
from .selectors import get_current_draft_session


DEFAULT_SESSION_DATA = {
    'focus_time': 25 * 60,
    'break_time': 5 * 60,
    'long_break_time': 15 * 60,
    'cycles_before_long_break': 4,
    'auto_start': False,
}


def _next_display_order(session):
    current_max = session.tasks.order_by('-display_order').values_list('display_order', flat=True).first()
    if current_max is None:
        return 0
    return current_max + 1


@transaction.atomic
def create_session(data=None, user=None):
    payload = {**DEFAULT_SESSION_DATA, **(data or {})}
    session = get_current_draft_session(user=user)
    if session is None:
        session = PomodoroSession.objects.create(user=user, **payload)
    else:
        for field, value in payload.items():
            setattr(session, field, value)
        session.save()
    return session


@transaction.atomic
def update_session_settings(session, data):
    fields = (
        'focus_time',
        'break_time',
        'long_break_time',
        'cycles_before_long_break',
        'auto_start',
    )
    for field in fields:
        if field in data:
            setattr(session, field, data[field])
    session.save(update_fields=[*fields, 'updated_at'])
    return session


@transaction.atomic
def start_session(session):
    if session.status != PomodoroSession.Status.DRAFT:
        raise ValueError('Only draft sessions can be started.')
    session.status = PomodoroSession.Status.ACTIVE
    if session.start_time is None:
        session.start_time = timezone.now()
    session.end_time = None
    session.save(update_fields=['status', 'start_time', 'end_time', 'updated_at'])
    return session


@transaction.atomic
def finish_session(session, data):
    fields = (
        'start_time',
        'end_time',
        'total_focus_time',
        'total_break_time',
        'completed_pomodoros',
        'points',
    )
    for field in fields:
        if field in data:
            setattr(session, field, data[field])
    if session.start_time is None:
        session.start_time = timezone.now()
    if session.end_time is None:
        session.end_time = timezone.now()
    session.status = PomodoroSession.Status.ENDED
    session.save(update_fields=[*fields, 'status', 'updated_at'])
    return session


@transaction.atomic
def abandon_session(session, data=None):
    payload = data or {}
    if 'end_time' in payload:
        session.end_time = payload['end_time']
    elif session.end_time is None:
        session.end_time = timezone.now()
    session.status = PomodoroSession.Status.ABANDONED
    session.save(update_fields=['end_time', 'status', 'updated_at'])
    return session


@transaction.atomic
def create_task(data, user=None):
    session = data['session']
    task = PomodoroTask.objects.create(
        id=data.get('id'),
        user=user,
        session=session,
        title=data['title'],
        estimated_pomodoros=data.get('estimated_pomodoros', 1),
        actual_pomodoros=data.get('actual_pomodoros', 0),
        completed=data.get('completed', False),
        display_order=data.get('display_order', _next_display_order(session)),
    )
    return task


@transaction.atomic
def update_task(task, data):
    fields = ('title', 'estimated_pomodoros', 'actual_pomodoros', 'completed', 'display_order')
    updated_fields = []
    for field in fields:
        if field in data:
            setattr(task, field, data[field])
            updated_fields.append(field)
    if updated_fields:
        task.save(update_fields=[*updated_fields, 'updated_at'])
    return task


@transaction.atomic
def delete_task(task):
    task.delete()


@transaction.atomic
def reorder_tasks(task_orders):
    for item in task_orders:
        PomodoroTask.objects.filter(id=item['id']).update(display_order=item['display_order'])


@transaction.atomic
def clear_sessions(user=None):
    queryset = PomodoroSession.objects.filter(status=PomodoroSession.Status.ENDED)
    if user is None:
        queryset = queryset.filter(user__isnull=True)
    else:
        queryset = queryset.filter(user=user)
    queryset.delete()
