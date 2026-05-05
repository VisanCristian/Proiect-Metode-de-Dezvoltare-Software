from django.db import IntegrityError
from django.test import TestCase

from apps.pomodoro.models import PomodoroSession, PomodoroTask


class PomodoroModelTests(TestCase):
    def test_creates_valid_session_and_task(self):
        session = PomodoroSession.objects.create(status=PomodoroSession.Status.DRAFT)
        task = PomodoroTask.objects.create(session=session, title='Study chapter 1')

        self.assertEqual(session.status, PomodoroSession.Status.DRAFT)
        self.assertEqual(task.estimated_pomodoros, 1)
        self.assertEqual(task.actual_pomodoros, 0)

    def test_task_is_deleted_when_session_is_deleted(self):
        session = PomodoroSession.objects.create()
        task = PomodoroTask.objects.create(session=session, title='Review notes')

        session.delete()

        self.assertFalse(PomodoroTask.objects.filter(id=task.id).exists())

    def test_task_requires_title(self):
        session = PomodoroSession.objects.create()

        with self.assertRaises(IntegrityError):
            PomodoroTask.objects.create(session=session, title=None)
