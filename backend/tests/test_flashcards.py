import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient
from FlashCards.models import Deck, Flashcard

@pytest.fixture
def auth_client():
    client = APIClient()
    user = User.objects.create_user(username='testuser', password='password123')
    client.force_authenticate(user=user)
    return client, user

@pytest.mark.django_db
class TestDecks:
    url = '/api/flashcards/decks/'

    def test_create_deck_success(self, auth_client):
        client, user = auth_client
        data = {'title': 'Test Deck', 'description': 'A test deck'}
        response = client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Deck.objects.filter(title='Test Deck', user=user).exists()

    def test_list_decks_success(self, auth_client):
        client, user = auth_client
        Deck.objects.create(user=user, title='My Deck')
        response = client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_user_isolation(self, auth_client):
        client, _ = auth_client
        other_user = User.objects.create_user(username='other', password='password')
        Deck.objects.create(user=other_user, title='Other Deck')
        response = client.get(self.url)
        assert len(response.data) == 0

@pytest.mark.django_db
class TestFlashcards:
    url = '/api/flashcards/cards/'

    @pytest.fixture
    def deck(self, auth_client):
        _, user = auth_client
        return Deck.objects.create(user=user, title='Test Deck')

    def test_create_flashcard_success(self, auth_client, deck):
        client, _ = auth_client
        data = {'deck': deck.id, 'question': 'Q', 'answer': 'A'}
        response = client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED

    def test_update_flashcard_success(self, auth_client, deck):
        client, _ = auth_client
        card = Flashcard.objects.create(deck=deck, question='Old', answer='Old')
        response = client.put(f'{self.url}{card.id}/', {'deck': deck.id, 'question': 'New', 'answer': 'New'})
        assert response.status_code == status.HTTP_200_OK
        card.refresh_from_db()
        assert card.question == 'New'

    def test_delete_flashcard_success(self, auth_client, deck):
        client, _ = auth_client
        card = Flashcard.objects.create(deck=deck, question='Q', answer='A')
        response = client.delete(f'{self.url}{card.id}/')
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Flashcard.objects.filter(id=card.id).exists()

    def test_create_flashcard_invalid_deck(self, auth_client):
        client, _ = auth_client
        response = client.post(self.url, {'deck': 9999, 'question': 'Q', 'answer': 'A'})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
