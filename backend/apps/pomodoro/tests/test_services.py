from django.test import TestCase

from apps.pomodoro.models import PomodoroSession, PomodoroTask
from apps.pomodoro.selectors import get_or_create_draft_session
from apps.pomodoro.services import (
    clear_sessions,
    create_task,
    finish_session,
    reorder_tasks,
    start_session,
    update_session_settings,
)


class PomodoroServiceTests(TestCase):
    def test_get_or_create_draft_session_reuses_existing_draft(self):
        session = get_or_create_draft_session()
        same_session = get_or_create_draft_session()

        self.assertEqual(session.id, same_session.id)

    def test_update_session_settings(self):
        session = get_or_create_draft_session()

        update_session_settings(session, {'focus_time': 1800, 'auto_start': True})
        session.refresh_from_db()

        self.assertEqual(session.focus_time, 1800)
        self.assertTrue(session.auto_start)

    def test_start_session_marks_session_active(self):
        session = get_or_create_draft_session()

        start_session(session)
        session.refresh_from_db()

        self.assertEqual(session.status, PomodoroSession.Status.ACTIVE)
        self.assertIsNotNone(session.start_time)

    def test_create_task(self):
        session = get_or_create_draft_session()

        task = create_task({'session': session, 'title': 'Solve exercises'})

        self.assertEqual(task.session_id, session.id)
        self.assertEqual(task.display_order, 0)

    def test_reorder_tasks(self):
        session = get_or_create_draft_session()
        first = PomodoroTask.objects.create(session=session, title='First', display_order=0)
        second = PomodoroTask.objects.create(session=session, title='Second', display_order=1)

        reorder_tasks(
            [
                {'id': first.id, 'display_order': 1},
                {'id': second.id, 'display_order': 0},
            ]
        )

        first.refresh_from_db()
        second.refresh_from_db()

        self.assertEqual(first.display_order, 1)
        self.assertEqual(second.display_order, 0)

    def test_finish_session(self):
        session = get_or_create_draft_session()
        start_session(session)

        finish_session(session, {'completed_pomodoros': 3, 'points': 30})
        session.refresh_from_db()

        self.assertEqual(session.status, PomodoroSession.Status.ENDED)
        self.assertEqual(session.completed_pomodoros, 3)
        self.assertEqual(session.points, 30)
        self.assertIsNotNone(session.end_time)

    def test_clear_sessions_only_removes_ended_sessions(self):
        ended = PomodoroSession.objects.create(status=PomodoroSession.Status.ENDED)
        draft = PomodoroSession.objects.create(status=PomodoroSession.Status.DRAFT)

        clear_sessions()

        self.assertFalse(PomodoroSession.objects.filter(id=ended.id).exists())
        self.assertTrue(PomodoroSession.objects.filter(id=draft.id).exists())
