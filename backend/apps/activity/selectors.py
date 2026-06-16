from django.db.models import Sum
from django.db.models.functions import TruncMonth

from apps.pomodoro.models import PomodoroSession
from FlashCards.models import DeckSession
from Agents.models import AgentMemory


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

    all_months = sorted(set(focus_by_month) | set(cards_by_month))

    months = [
        {
            'month': month,
            'total_focus_time': focus_by_month.get(month, 0),
            'total_solved_cards': cards_by_month.get(month, 0),
        }
        for month in all_months
    ]

    try:
        flashcard_points = AgentMemory.objects.get(user=user).flashcard_points
    except AgentMemory.DoesNotExist:
        flashcard_points = 0

    total_focus_time = sum(focus_by_month.values())
    tokens = flashcard_points * total_focus_time

    return {
        'months': months,
        'flashcard_points': flashcard_points,
        'tokens': tokens,
    }
