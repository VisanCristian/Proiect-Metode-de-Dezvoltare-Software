from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import AgentMemory


class AgentMemoryApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memory, _ = AgentMemory.objects.get_or_create(user=request.user)
        return Response({
            'flashcard_points': memory.flashcard_points,
            'excel_subjects': memory.excel_subjects,
            'poor_subjects': memory.poor_subjects,
            'notes': memory.notes,
            'updated_at': memory.updated_at,
        })

    def patch(self, request):
        memory, _ = AgentMemory.objects.get_or_create(user=request.user)
        for field in ('flashcard_points', 'excel_subjects', 'poor_subjects', 'notes'):
            if field in request.data:
                setattr(memory, field, request.data[field])
        memory.save()
        return Response({'flashcard_points': memory.flashcard_points}, status=status.HTTP_200_OK)
