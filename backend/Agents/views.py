from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import AgentMemory, FlashcardPointLog


class AgentMemoryApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memory, _ = AgentMemory.objects.get_or_create(user=request.user)
        return Response({
            'excel_subjects': memory.excel_subjects,
            'poor_subjects': memory.poor_subjects,
            'notes': memory.notes,
            'updated_at': memory.updated_at,
        })

    def patch(self, request):
        memory, _ = AgentMemory.objects.get_or_create(user=request.user)
        for field in ('excel_subjects', 'poor_subjects', 'notes'):
            if field in request.data:
                setattr(memory, field, request.data[field])
        memory.save()
        return Response(status=status.HTTP_200_OK)


class FlashcardPointLogApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        points = request.data.get('points', 1)
        FlashcardPointLog.objects.create(user=request.user, points=points)
        return Response({'points': points}, status=status.HTTP_201_CREATED)
