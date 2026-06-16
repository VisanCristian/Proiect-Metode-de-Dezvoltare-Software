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
        points = int(request.data.get('points', 1))
        flashcard_id = request.data.get('flashcard_id')
        
        if flashcard_id is not None:
            flashcard_id = int(flashcard_id)
            from django.utils import timezone
            from django.db.models import Sum
            
            today = timezone.now().date()
            
            # Check if flashcard was answered today
            answered_today = FlashcardPointLog.objects.filter(
                user=request.user,
                flashcard_id=flashcard_id,
                earned_at__date=today
            ).exists()
            
            # Calculate points already earned for this flashcard today
            points_today = FlashcardPointLog.objects.filter(
                user=request.user,
                flashcard_id=flashcard_id,
                earned_at__date=today
            ).aggregate(Sum('points'))['points__sum'] or 0
            
            if points_today >= 500:
                return Response({
                    'message': 'Limit of 500 points per day reached for this flashcard.',
                    'points_awarded': 0,
                    'already_answered_today': True
                }, status=status.HTTP_200_OK)
            
            # Cap points so total does not exceed 500
            if points_today + points > 500:
                points = 500 - points_today
                
            FlashcardPointLog.objects.create(user=request.user, flashcard_id=flashcard_id, points=points)
            
            return Response({
                'message': f'Awarded {points} points.',
                'points_awarded': points,
                'already_answered_today': answered_today
            }, status=status.HTTP_201_CREATED)
        else:
            FlashcardPointLog.objects.create(user=request.user, points=points)
            return Response({'points_awarded': points}, status=status.HTTP_201_CREATED)

class ConsumeTokenApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from apps.activity.selectors import get_monthly_activity
        
        amount = int(request.data.get('amount', 50))
        memory, _ = AgentMemory.objects.get_or_create(user=request.user)
        
        # Calculate available tokens
        activity = get_monthly_activity(request.user)
        earned_tokens = sum(month.get('tokens', 0) for month in activity.get('months', []))
        
        available_tokens = 2500 + earned_tokens - memory.consumed_tokens
        
        if available_tokens < amount:
            return Response(
                {'message': f'Insufficient tokens. You have {available_tokens} tokens but need {amount}.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        memory.consumed_tokens += amount
        memory.save()
        
        return Response({'consumed': amount, 'available_tokens': available_tokens - amount}, status=status.HTTP_200_OK)
