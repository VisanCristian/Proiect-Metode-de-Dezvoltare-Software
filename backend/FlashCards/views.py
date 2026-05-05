from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Deck, Flashcard, SourceDocument, UserCardProgress, DeckSession
from .serializers import DeckSerializer, FlashcardSerializer, UserCardProgressSerializer, SourceDocumentSerializer, DeckSessionSerializer
from .recommendations import get_recommendations_list

class DeckViewSet(viewsets.ModelViewSet):
    queryset = Deck.objects.all()
    serializer_class = DeckSerializer

    def perform_create(self, serializer):
        req_user_id = self.request.data.get('user_id')
        user = self.request.user if self.request.user.is_authenticated else None
        
        if not user:
            if req_user_id is not None:
                try:
                    user = User.objects.get(id=req_user_id)
                except User.DoesNotExist:
                    user = User.objects.create_user(id=req_user_id, username=f'user_{req_user_id}', password='password123')
            else:
                user = User.objects.first()
                if not user:
                    user = User.objects.create_user(username='demo_user', password='password123')

        serializer.save(user=user)

class FlashcardViewSet(viewsets.ModelViewSet):
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer

class UserCardProgressViewSet(viewsets.ModelViewSet):
    queryset = UserCardProgress.objects.all()
    serializer_class = UserCardProgressSerializer
    
class SourceDocumentViewSet(viewsets.ModelViewSet):
    queryset = SourceDocument.objects.all()
    serializer_class = SourceDocumentSerializer

class DeckSessionViewSet(viewsets.ModelViewSet):
    queryset = DeckSession.objects.all()
    serializer_class = DeckSessionSerializer

    def perform_create(self, serializer):
        req_user_id = self.request.data.get('user_id')
        user = self.request.user if self.request.user.is_authenticated else None
        
        if not user:
            if req_user_id is not None:
                try:
                    user = User.objects.get(id=req_user_id)
                except User.DoesNotExist:
                    user = User.objects.create_user(id=req_user_id, username=f'user_{req_user_id}', password='password123')
            else:
                user = User.objects.first()
                if not user:
                    user = User.objects.create_user(username='demo_user', password='password123')

        serializer.save(user=user)

from django.core.cache import cache

class RecommendationsView(APIView):
    def get(self, request):
        try:
            # Check if recommendations are already generated today (cached for 24 hours)
            recommended_ids = cache.get('daily_recommendations')
            
            if recommended_ids is None:
                recommended_ids = get_recommendations_list()
                # Cache the generated recommendations for 24 hours (86400 seconds)
                cache.set('daily_recommendations', recommended_ids, 86400)

            decks = Deck.objects.filter(id__in=recommended_ids)
            serializer = DeckSerializer(decks, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)