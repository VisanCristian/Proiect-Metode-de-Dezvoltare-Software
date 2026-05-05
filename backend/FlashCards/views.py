from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Deck, Flashcard, SourceDocument, UserCardProgress, DeckSession
from .serializers import DeckSerializer, FlashcardSerializer, UserCardProgressSerializer, SourceDocumentSerializer, DeckSessionSerializer
from .recommendations import get_recommendations_list

class DeckViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Deck.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]

class UserCardProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserCardProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserCardProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SourceDocumentViewSet(viewsets.ModelViewSet):
    queryset = SourceDocument.objects.all()
    serializer_class = SourceDocumentSerializer
    permission_classes = [IsAuthenticated]

class DeckSessionViewSet(viewsets.ModelViewSet):
    serializer_class = DeckSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DeckSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from django.core.cache import cache

class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cache_key = f'daily_recommendations_{request.user.id}'
            recommended_ids = cache.get(cache_key)
            
            if recommended_ids is None:
                recommended_ids = get_recommendations_list()
                cache.set(cache_key, recommended_ids, 86400)

            decks = Deck.objects.filter(id__in=recommended_ids)
            serializer = DeckSerializer(decks, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)