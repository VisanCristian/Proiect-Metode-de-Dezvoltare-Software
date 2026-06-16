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
class TestGroupManagement:
    url_create = '/api/groups/create'
    url_join = '/api/groups/join'

    def test_create_group_success(self, auth_client):
        client, user = auth_client
        data = {'name': 'Study Group Alpha'}
        response = client.post(self.url_create, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert 'token' in response.data
        assert Group.objects.filter(name='Study Group Alpha', owner=user.id).exists()

    def test_create_group_missing_name(self, auth_client):
        client, _ = auth_client
        response = client.post(self.url_create, {})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_join_group_success(self, auth_client):
        client, user = auth_client
        other = User.objects.create_user(username='other', password='pw')
        group = Group.objects.create(name='Other Group', owner=other.id, token='JOIN123')
        response = client.post(self.url_join, {'token': 'JOIN123'})
        assert response.status_code == status.HTTP_200_OK
        assert UserGroup.objects.filter(group=group, user_id=user.id).exists()

    def test_join_group_invalid_token(self, auth_client):
        client, _ = auth_client
        response = client.post(self.url_join, {'token': 'WRONG'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
class TestGroupInteractions:
    def test_share_deck_success(self, auth_client):
        client, user = auth_client
        group = Group.objects.create(name='Share Group', owner=user.id)
        UserGroup.objects.create(group=group, user_id=user.id)
        deck = Deck.objects.create(user=user, title='My Shared Deck')
        
        url = f'/api/groups/{group.id}/share_deck'
        response = client.post(url, {'deck_id': deck.id})
        assert response.status_code == status.HTTP_201_CREATED
        assert group.shared_decks.filter(id=deck.id).exists()

    def test_unauthorized_detail_access(self, auth_client):
        client, _ = auth_client
        other = User.objects.create_user(username='stranger', password='pw')
        group = Group.objects.create(name='Private', owner=other.id)
        
        url = f'/api/groups/detail/{group.id}'
        response = client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
