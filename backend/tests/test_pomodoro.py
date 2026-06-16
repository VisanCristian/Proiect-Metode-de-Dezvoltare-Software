import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from apps.pomodoro.models import PomodoroSession

@pytest.fixture
def auth_client():
    client = APIClient()
    user = User.objects.create_user(username='pomouser', password='password123')
    client.force_authenticate(user=user)
    return client, user

@pytest.mark.django_db
def test_create_pomodoro_session(auth_client):
    """
    Verifică dacă un utilizator poate crea o sesiune Pomodoro cu durată validă.
    """
    client, user = auth_client
    url = '/api/pomodoro/sessions/'
    data = {
        'focus_time': 1500, # 25 min
        'break_time': 300,  # 5 min
    }
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert PomodoroSession.objects.filter(user=user, focus_time=1500).exists()

@pytest.mark.django_db
def test_activity_report(auth_client):
    """
    Verifică dacă raportul de activitate lunară returnează date corecte.
    """
    client, user = auth_client
    from django.utils import timezone
    from datetime import timedelta
    
    # Create an ended session
    now = timezone.now()
    PomodoroSession.objects.create(
        user=user,
        start_time=now,
        end_time=now + timedelta(minutes=25),
        status=PomodoroSession.Status.ENDED,
        total_focus_time=1500
    )
    
    url = '/api/activity/'
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) > 0
    assert response.data[0]['total_focus_time'] == 1500
