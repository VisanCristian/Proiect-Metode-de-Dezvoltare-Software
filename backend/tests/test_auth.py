import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
class TestUserRegistration:
    url = '/api/auth/users/'

    def test_register_success(self, api_client):
        data = {
            'username': 'newuser',
            'password': 'ComplexPassword123!',
            're_password': 'ComplexPassword123!'
        }
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(username='newuser').exists()

    def test_register_password_mismatch(self, api_client):
        data = {
            'username': 'newuser',
            'password': 'ComplexPassword123!',
            're_password': 'mismatch'
        }
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_username_taken(self, api_client):
        User.objects.create_user(username='existinguser', password='ComplexPassword123!')
        data = {
            'username': 'existinguser',
            'password': 'ComplexPassword123!',
            're_password': 'ComplexPassword123!'
        }
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_fields(self, api_client):
        data = {'username': 'incomplete'}
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
class TestUserLogin:
    url = '/api/auth/jwt/create/'

    def test_login_success(self, api_client):
        User.objects.create_user(username='loginuser', password='ComplexPassword123!')
        data = {'username': 'loginuser', 'password': 'ComplexPassword123!'}
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data

    def test_login_invalid_password(self, api_client):
        User.objects.create_user(username='loginuser', password='ComplexPassword123!')
        data = {'username': 'loginuser', 'password': 'wrongpassword'}
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client):
        data = {'username': 'nobody', 'password': 'ComplexPassword123!'}
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_unauthenticated_access_denied(api_client):
    url = '/api/flashcards/decks/'
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
