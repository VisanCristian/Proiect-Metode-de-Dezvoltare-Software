import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_register_user(api_client):
    """
    Verifică dacă un utilizator se poate înregistra cu succes.
    """
    url = '/api/auth/users/'
    data = {
        'username': 'testuser',
        'password': 'testpassword123',
        're_password': 'testpassword123'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(username='testuser').exists()

@pytest.mark.django_db
def test_login_user(api_client):
    """
    Verifică dacă un utilizator se poate loga și primește un token JWT valid.
    """
    User.objects.create_user(username='testuser', password='testpassword123')
    url = '/api/auth/jwt/create/'
    data = {
        'username': 'testuser',
        'password': 'testpassword123'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data

@pytest.mark.django_db
def test_access_without_token(api_client):
    """
    Verifică dacă accesul la o resursă protejată fără token returnează 401.
    """
    url = '/api/flashcards/decks/'
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
