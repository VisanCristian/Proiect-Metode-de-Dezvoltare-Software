from django.urls import path
from .views import AgentMemoryApi, FlashcardPointLogApi, ConsumeTokenApi

urlpatterns = [
    path('memory/', AgentMemoryApi.as_view(), name='agent-memory'),
    path('points/', FlashcardPointLogApi.as_view(), name='flashcard-points'),
    path('consume-token/', ConsumeTokenApi.as_view(), name='consume-token'),
]
