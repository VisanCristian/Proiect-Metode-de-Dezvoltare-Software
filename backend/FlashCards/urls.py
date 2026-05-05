from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeckViewSet, FlashcardViewSet, SourceDocumentViewSet, UserCardProgressViewSet, DeckSessionViewSet, RecommendationsView

router = DefaultRouter()
router.register(r'decks', DeckViewSet)
router.register(r'cards', FlashcardViewSet)
router.register(r'progress', UserCardProgressViewSet)
router.register(r'documents', SourceDocumentViewSet)
router.register(r'sessions', DeckSessionViewSet)

urlpatterns = [
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
    path('', include(router.urls)), 
    #includes all the routes defined in the router (decks, cards, progress)
]