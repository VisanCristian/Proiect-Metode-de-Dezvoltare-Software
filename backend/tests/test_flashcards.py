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
def test_create_deck(auth_client):
    """
    Verifică dacă un utilizator poate crea un deck.
    """
    client, user = auth_client
    url = '/api/flashcards/decks/'
    data = {'title': 'Test Deck', 'description': 'A test deck'}
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert Deck.objects.filter(title='Test Deck', user=user).exists()

@pytest.mark.django_db
def test_list_decks(auth_client):
    """
    Verifică dacă un utilizator își poate lista deck-urile.
    """
    client, user = auth_client
    Deck.objects.create(user=user, title='My Deck')
    url = '/api/flashcards/decks/'
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'My Deck'

@pytest.mark.django_db
def test_user_cannot_see_others_decks(auth_client):
    """
    Verifică dacă un utilizator NU vede deck-urile altui utilizator.
    """
    client, user = auth_client
    other_user = User.objects.create_user(username='other', password='password')
    Deck.objects.create(user=other_user, title='Other Deck')
    
    url = '/api/flashcards/decks/'
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 0

@pytest.mark.django_db
def test_crud_flashcard(auth_client):
    """
    Verifică operațiile CRUD pentru flashcards.
    """
    client, user = auth_client
    deck = Deck.objects.create(user=user, title='Test Deck')
    
    # Create
    url = '/api/flashcards/cards/'
    data = {'deck': deck.id, 'question': 'What is 2+2?', 'answer': '4'}
    response = client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    card_id = response.data['id']

    # Update
    update_url = f'/api/flashcards/cards/{card_id}/'
    update_data = {'deck': deck.id, 'question': 'Updated?', 'answer': 'Yes'}
    response = client.put(update_url, update_data)
    assert response.status_code == status.HTTP_200_OK
    assert Flashcard.objects.get(id=card_id).question == 'Updated?'

    # Delete
    response = client.delete(update_url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Flashcard.objects.filter(id=card_id).exists()
