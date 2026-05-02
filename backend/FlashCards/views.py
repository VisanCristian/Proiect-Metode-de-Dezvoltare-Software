from rest_framework import viewsets
from .models import Deck, Flashcard, SourceDocument, SourceDocument, UserCardProgress
from .serializers import DeckSerializer, FlashcardSerializer, UserCardProgressSerializer, SourceDocumentSerializer

class DeckViewSet(viewsets.ModelViewSet):
    queryset = Deck.objects.all()
    serializer_class = DeckSerializer

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer

class UserCardProgressViewSet(viewsets.ModelViewSet):
    queryset = UserCardProgress.objects.all()
    serializer_class = UserCardProgressSerializer
    
class SourceDocumentViewSet(viewsets.ModelViewSet):
    queryset = SourceDocument.objects.all()
    serializer_class = SourceDocumentSerializer