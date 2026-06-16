from django.urls import path
from .views import AgentMemoryApi, FlashcardPointLogApi

urlpatterns = [
    path('memory/', AgentMemoryApi.as_view(), name='agent-memory'),
    path('points/', FlashcardPointLogApi.as_view(), name='flashcard-points'),
]
