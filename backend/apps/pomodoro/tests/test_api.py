from django.test import TestCase
from rest_framework.test import APIClient

from apps.pomodoro.models import PomodoroSession, PomodoroTask


class PomodoroApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_get_current_session_creates_draft(self):
        response = self.client.get('/api/pomodoro/sessions/current/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], PomodoroSession.Status.DRAFT)

    def test_task_crud_and_reorder(self):
        session_response = self.client.get('/api/pomodoro/sessions/current/')
        session_id = session_response.json()['id']

        create_response = self.client.post(
            '/api/pomodoro/tasks/',
            {
                'session_id': session_id,
                'title': 'Read chapter',
                'estimated_pomodoros': 2,
            },
            format='json',
        )
        task_id = create_response.json()['id']

        patch_response = self.client.patch(
            f'/api/pomodoro/tasks/{task_id}/',
            {'completed': True, 'actual_pomodoros': 1},
            format='json',
        )
        reorder_response = self.client.post(
            '/api/pomodoro/tasks/reorder/',
            {'tasks': [{'id': task_id, 'display_order': 0}]},
            format='json',
        )
        delete_response = self.client.delete(f'/api/pomodoro/tasks/{task_id}/')

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(reorder_response.status_code, 204)
        self.assertEqual(delete_response.status_code, 204)

    def test_session_start_finish_and_clear(self):
        current_response = self.client.get('/api/pomodoro/sessions/current/')
        session_id = current_response.json()['id']

        start_response = self.client.post(f'/api/pomodoro/sessions/{session_id}/start/')
        finish_response = self.client.patch(
            f'/api/pomodoro/sessions/{session_id}/',
            {
                'status': 'ended',
                'total_focus_time': 120,
                'total_break_time': 30,
                'completed_pomodoros': 2,
                'points': 20,
            },
            format='json',
        )
        list_response = self.client.get('/api/pomodoro/sessions/')
        clear_response = self.client.delete('/api/pomodoro/sessions/clear/')

        self.assertEqual(start_response.status_code, 200)
        self.assertEqual(finish_response.status_code, 200)
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)
        self.assertEqual(clear_response.status_code, 204)
        self.assertEqual(PomodoroSession.objects.filter(status=PomodoroSession.Status.ENDED).count(), 0)
