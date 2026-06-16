from django.urls import path
from .views import AgentMemoryApi

urlpatterns = [
    path('memory/', AgentMemoryApi.as_view(), name='agent-memory'),
]
