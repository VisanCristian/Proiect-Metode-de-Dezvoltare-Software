from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeckViewSet, FlashcardViewSet, SourceDocumentViewSet, UserCardProgressViewSet, DeckSessionViewSet, RecommendationsView

router = DefaultRouter()
router.register(r'decks', DeckViewSet, basename='deck')
router.register(r'cards', FlashcardViewSet, basename='card')
router.register(r'progress', UserCardProgressViewSet, basename='progress')
router.register(r'documents', SourceDocumentViewSet, basename='document')
router.register(r'sessions', DeckSessionViewSet, basename='session')

urlpatterns = [
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
    path('', include(router.urls)), 
    #includes all the routes defined in the router (decks, cards, progress)
]