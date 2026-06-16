import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from Group.models import Group, UserGroup
from FlashCards.models import Deck

@pytest.fixture
def auth_client():
    client = APIClient()
    user = User.objects.create_user(username='groupuser', password='password123')
    client.force_authenticate(user=user)
    return client, user

@pytest.mark.django_db
def test_create_group(auth_client):
    """
    Verifică dacă un utilizator poate crea un grup și primește un token.
    """
    client, user = auth_client
    url = '/api/groups/create'
    data = {'name': 'Study Group Alpha'}
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert 'token' in response.data
    assert Group.objects.filter(name='Study Group Alpha', owner=user.id).exists()

@pytest.mark.django_db
def test_join_group(auth_client):
    """
    Verifică dacă un utilizator se poate alătura unui grup folosind un token.
    """
    client, user = auth_client
    # Create group with another user
    other_user = User.objects.create_user(username='other_owner', password='password')
    group = Group.objects.create(name='Other Group', owner=other_user.id, token='TESTTOKEN123')
    
    url = '/api/groups/join'
    data = {'token': 'TESTTOKEN123'}
    response = client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert UserGroup.objects.filter(group=group, user_id=user.id).exists()

@pytest.mark.django_db
def test_share_deck_with_group(auth_client):
    """
    Verifică dacă un utilizator poate partaja un deck cu un grup din care face parte.
    """
    client, user = auth_client
    group = Group.objects.create(name='Share Group', owner=user.id)
    UserGroup.objects.create(group=group, user_id=user.id)
    deck = Deck.objects.create(user=user, title='My Shared Deck')
    
    url = f'/api/groups/{group.id}/share_deck'
    data = {'deck_id': deck.id}
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert group.shared_decks.filter(id=deck.id).exists()

@pytest.mark.django_db
def test_unauthorized_group_access(auth_client):
    """
    Verifică dacă un utilizator care nu este membru primește 403 la detaliile grupului.
    """
    client, user = auth_client
    other_user = User.objects.create_user(username='stranger', password='password')
    group = Group.objects.create(name='Private Group', owner=other_user.id)
    
    url = f'/api/groups/detail/{group.id}'
    response = client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN
