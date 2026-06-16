import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from apps.pomodoro.models import PomodoroSession
from django.utils import timezone
from datetime import timedelta

@pytest.fixture
def auth_client():
    client = APIClient()
    user = User.objects.create_user(username='pomouser', password='password123')
    client.force_authenticate(user=user)
    return client, user

@pytest.mark.django_db
class TestPomodoroSessions:
    url = '/api/pomodoro/sessions/'

    def test_create_session_success(self, auth_client):
        client, user = auth_client
        data = {'focus_time': 1500, 'break_time': 300}
        response = client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert PomodoroSession.objects.filter(user=user, focus_time=1500).exists()

    def test_create_session_invalid_data(self, auth_client):
        client, _ = auth_client
        data = {'focus_time': -1}
        response = client.post(self.url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_unauthenticated_create_denied(self):
        client = APIClient()
        response = client.post(self.url, {})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
class TestActivityReport:
    url = '/api/activity/'

    def test_report_success(self, auth_client):
        client, user = auth_client
        now = timezone.now()
        PomodoroSession.objects.create(
            user=user,
            start_time=now,
            end_time=now + timedelta(minutes=25),
            status=PomodoroSession.Status.ENDED,
            total_focus_time=1500
        )
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) > 0
        assert response.data[0]['total_focus_time'] == 1500

    def test_report_empty_for_new_user(self, auth_client):
        client, _ = auth_client
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0
