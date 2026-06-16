from django.db.models import Sum
from django.db.models.functions import TruncMonth

from apps.pomodoro.models import PomodoroSession
from FlashCards.models import DeckSession
from Agents.models import FlashcardPointLog


def get_monthly_activity(user):
    focus_rows = (
        PomodoroSession.objects
        .filter(user=user, status=PomodoroSession.Status.ENDED)
        .annotate(month=TruncMonth('start_time'))
        .values('month')
        .annotate(total_focus_time=Sum('total_focus_time'))
        .order_by('month')
    )

    cards_rows = (
        DeckSession.objects
        .filter(user=user)
        .annotate(month=TruncMonth('date'))
        .values('month')
        .annotate(total_solved_cards=Sum('responses'))
        .order_by('month')
    )

    points_rows = (
        FlashcardPointLog.objects
        .filter(user=user)
        .annotate(month=TruncMonth('earned_at'))
        .values('month')
        .annotate(total_points=Sum('points'))
        .order_by('month')
    )

    focus_by_month = {
        row['month'].strftime('%Y-%m'): row['total_focus_time']
        for row in focus_rows
        if row['month'] is not None
    }
    cards_by_month = {
        row['month'].strftime('%Y-%m'): row['total_solved_cards']
        for row in cards_rows
        if row['month'] is not None
    }
    points_by_month = {
        row['month'].strftime('%Y-%m'): row['total_points']
        for row in points_rows
        if row['month'] is not None
    }

    all_months = sorted(set(focus_by_month) | set(cards_by_month) | set(points_by_month))

    months = [
        {
            'month': month,
            'total_focus_time': focus_by_month.get(month, 0),
            'total_solved_cards': cards_by_month.get(month, 0),
            'flashcard_points': points_by_month.get(month, 0),
            'tokens': points_by_month.get(month, 0) + (focus_by_month.get(month, 0) // 60),
        }
        for month in all_months
    ]

    from Agents.models import AgentMemory
    memory, _ = AgentMemory.objects.get_or_create(user=user)
    earned_tokens = sum(m['tokens'] for m in months)
    available_tokens = 2500 + earned_tokens - memory.consumed_tokens

    return {
        'months': months,
        'available_tokens': available_tokens,
        'earned_tokens': earned_tokens,
        'consumed_tokens': memory.consumed_tokens
    }
